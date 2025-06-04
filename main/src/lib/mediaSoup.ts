import * as mediasoup from "mediasoup";
import os from "os";
import config from "../config/configuration";
import { SctpCapabilities } from "mediasoup/node/lib/sctpParametersTypes";

class MediasoupManager {
  public workers: mediasoup.types.Worker<mediasoup.types.AppData>[];
  public nextWorkerIndex: number;
  public rooms: Record<
    string,
    {
      router: mediasoup.types.Router<mediasoup.types.AppData>;
      consumerTransports: Record<string, mediasoup.types.WebRtcTransport>;
      producerTransports: Record<string, mediasoup.types.WebRtcTransport>;
      producers: Record<string, mediasoup.types.Producer>;
      producerMetadata: Record<
        string,
        {
          userId: string;
          userName: string; // Display name
          profilePicture: string;
          kind: "audio" | "video"; // Track type
          type?: "camera" | "screen" | "mic";
        }
      >;
      consumers: Record<string, mediasoup.types.Consumer>;
      audioLevelObserver: mediasoup.types.AudioLevelObserver<mediasoup.types.AppData>;
      activeSpeakerObserver: mediasoup.types.ActiveSpeakerObserver<mediasoup.types.AppData>;
    }
  >;

  constructor() {
    this.workers = [];
    this.nextWorkerIndex = 0;
    this.rooms = {};
    this.initializeWorkers();
  }
  //code to intialize worker for mediasoup
  private async initializeWorkers() {
    const numWorkers = Math.min(2, os.cpus().length); //os.cpus().length; // Use all CPU cores when changing my code to microservice
    console.log(`Spawning ${numWorkers} mediasoup workers...`);

    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: "warn",
        rtcMinPort: 20000,
        rtcMaxPort: 20010,
      });

      worker.on("died", () => {
        console.error("Mediasoup Worker died, exiting...");
        process.exit(1);
      });

      this.workers.push(worker);
    }
  }
  //code to create or return an existing route
  async getOrCreateRoomRouter(roomId: string) {
    if (this.rooms[roomId]) {
      console.log(`Router for room ${roomId} already exists`);
      return this.rooms[roomId].router;
    }

    if (this.workers.length === 0) {
      throw new Error("No available Mediasoup workers!");
    }

    // Round-robin selection of workers
    const worker = this.workers[this.nextWorkerIndex];
    this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
    // create the router with the mediacodecs
    const router = await worker.createRouter({
      mediaCodecs: config.mediasoup.mediaCodecs,
    });
    /**
     * Create a mediasoup AudioLevelObserver.
     * This has the users which are currenly speaking as arrays.can loop through everything to update ui in fronend if needed
     */
    const audioLevelObserver = await router.createAudioLevelObserver({
      maxEntries: 1,
      threshold: -80,
      interval: 800,
    });
    audioLevelObserver.on("volumes", (volumes) => {
      const { producer, volume } = volumes[0];
      const peerId = producer.appData.peerId;
      //here notify all the users who the current speaker is by emitting the event 'activeSpeaker'
      /* 
      socket.emit('activeSpeaker',{
						peerId : producer.appData.peerId,
						volume : volume
					})
       */
    });
    audioLevelObserver.on("silence", () => {
      //here notify all the users that the current speaker is noone by emitting the event 'activeSpeaker'
      /* 
      socket.emit('activeSpeaker', { peerId: null })
       */
    });
    /**
     *Create a mediasoup ActiveSpeakerObserver.
     *This is the dominant speaker(speaker whose audio is the highest) usually for switching speaker(ui)
     */

    const activeSpeakerObserver = await router.createActiveSpeakerObserver();
    activeSpeakerObserver.on("dominantspeaker", (data) => {
      const { producer } = data;
      const peerId = producer.appData.peerId;
      /* socket.emit('dominantSpeaker', { peerId }) */
    });

    this.rooms[roomId] = {
      router,
      consumerTransports: {},
      producerTransports: {},
      producers: {},
      consumers: {},
      producerMetadata: {},
      audioLevelObserver,
      activeSpeakerObserver,
    };

    console.log(`Created new router for room: ${roomId}`);
    return router;
  }
  //code to generate transport for sender and reciever
  async createWebRtcTransport(
    sessionId: string,
    senderOrConsumer: "sender" | "consumer",
    userId: string,
    sctpCapabilities: SctpCapabilities
  ) {
    const room = this.rooms[sessionId];
    if (!room) {
      throw new Error(`Gig ${sessionId} does not exist`);
    }
    const PUBLIC_IP = config.app.publicIp;
    const transport = await room.router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: PUBLIC_IP }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      appData: { userId },
      initialAvailableOutgoingBitrate: 1000000,
      iceConsentTimeout: 20,
      enableSctp: Boolean(sctpCapabilities),
      numSctpStreams: (sctpCapabilities || {}).numStreams,
    });
    //sctp is for additional features like bots and recording
    if (senderOrConsumer == "sender") {
      this.rooms[sessionId].producerTransports[transport.id] = transport;
    } else {
      this.rooms[sessionId].consumerTransports[transport.id] = transport;
    }
    console.log("This is the ip=",PUBLIC_IP)
    console.log("This is the transport")
    console.log(transport)
    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }
  //code to connect the producer transport
  async connectProducerTransport({
    sessionId,
    transportId,
    dtlsParameters,
  }: {
    sessionId: string;
    transportId: string;
    dtlsParameters: mediasoup.types.DtlsParameters;
  }) {
    await this.rooms[sessionId].producerTransports[transportId].connect({
      dtlsParameters,
    });
    return { success: "success" };
  }
  /**
   * This function sets up a producer for sending media to the peer.
   * A producer represents the source of a single media track (audio or video).
   */
  async createProducer({
    sessionId,
    transportId,
    kind,
    rtpParameters,
    userDetails,
    appData,
  }: {
    sessionId: string;
    transportId: string;
    kind: mediasoup.types.MediaKind;
    rtpParameters: mediasoup.types.RtpParameters;
    userDetails: {
      userId: string;
      userName: string;
      profilePicture: string;
    };
    appData: { type: "camera" | "screen" | "mic"; paused?: boolean };
  }) {
    const transport = this.rooms[sessionId].producerTransports[transportId]; // Get transport

    if (!transport) {
      throw new Error("Transport not found");
    }
    // Create a Producer instance
    const producer = await transport.produce({
      kind,
      rtpParameters,
      appData: { ...appData, peerId: userDetails.userId },
    });
    console.log(`ispaused in producer:` + appData.paused);
    if (appData.paused) {
      await producer.pause();
    }
    producer?.on("transportclose", () => {
      console.log("Producer transport closed");
      producer?.close();
    });
    // Store the producer
    this.rooms[sessionId].producers[producer.id] = producer;
    this.rooms[sessionId].producerMetadata[producer.id] = {
      kind: kind,
      userId: userDetails.userId,
      userName: userDetails.userName,
      profilePicture: userDetails.profilePicture,
      type: appData.type as "camera" | "screen" | "mic",
    };

    // Return the producer ID to the client
    return { id: producer.id };
  }

  //code to create consumer
  async createConsumer({
    sessionId,
    consumerTransportId,
    producerId,
    rtpCapabilities,
  }: {
    sessionId: string;
    consumerTransportId: string;
    producerId: string;
    rtpCapabilities: mediasoup.types.RtpCapabilities;
  }) {
    const room = this.rooms[sessionId];
    if (!room) throw new Error(`Room ${sessionId} does not exist`);

    const producer = room.producers[producerId];
    if (!producer) throw new Error("Producer not found");

    if (!room.router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error("Cannot consume this producer");
    }
    const consumer = await this.rooms[sessionId].consumerTransports[
      consumerTransportId
    ].consume({
      producerId,
      rtpCapabilities,
      paused: producer?.kind === "video",
    });
    console.log("consumer created");
    this.rooms[sessionId].consumers[consumer.id] = consumer;
    return {
      id: consumer.id,
      producerId: consumer.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      userId: this.rooms[sessionId].producerMetadata[producerId].userId,
      userName: this.rooms[sessionId].producerMetadata[producerId].userName,
      profilePicture:
        this.rooms[sessionId].producerMetadata[producerId].profilePicture,
      type: this.rooms[sessionId].producerMetadata[producerId].type,
      pause: producer.paused,
    };
  }
  /**
   * Event handler for connecting the receiving transport.
   * This step is required before the transport can be used to receive media.
   */
  async connectConsumer({
    sessionId,
    transportId,
    dtlsParameters,
  }: {
    sessionId: string;
    transportId: string;
    dtlsParameters: mediasoup.types.DtlsParameters;
  }) {
    const consumerTransport =
      this.rooms[sessionId].consumerTransports[transportId];
    if (!consumerTransport) throw new Error("Transport not found");

    await consumerTransport.connect({ dtlsParameters });
    console.log("consumer connected");
    return { success: "success" };
  }
  //function to close the consumer
  async closeConsumer({
    roomId,
    consumerId,
  }: {
    roomId: string;
    consumerId: string;
  }) {
    console.log("consumer closed");
    await this.rooms[roomId].consumers[consumerId].close();
  }
  //function to close the consumer
  async pauseConsumer({
    roomId,
    consumerId,
  }: {
    roomId: string;
    consumerId: string;
  }) {
    console.log("consumer paused");
    await this.rooms[roomId].consumers[consumerId].pause();
  }
  async resumeConsumer({
    sessionId,
    consumerId,
  }: {
    sessionId: string;
    consumerId: string;
  }) {
    console.log("consumer resumed");
    await this.rooms[sessionId].consumers[consumerId].resume();
  }
  async pauseOrResumeproducer({
    sessionId,
    producerId,
    isPaused,
  }: {
    sessionId: string;
    producerId: string;
    isPaused: boolean;
  }) {
    const room = this.rooms[sessionId];
    if (!room) {
      console.error(`Room not found: sessionId=${sessionId}`);
      throw new Error("Room not found");
    }

    const producer = room.producers[producerId];
    if (!producer) {
      console.error(
        `Producer not found: producerId=${producerId}, sessionId=${sessionId}`
      );
      throw new Error("Producer not found");
    }

    const metadata = room.producerMetadata[producerId];
    if (!metadata) {
      console.warn(
        `Metadata missing for producerId=${producerId}, sessionId=${sessionId}`
      );
    }

    if (isPaused) {
      await producer.pause();
      console.log(`Producer paused: ${producerId}`);
    } else {
      await producer.resume();
      console.log(`Producer resumed: ${producerId}`);
    }
    return metadata;
  }
  /**
   * This function is for disconnectiong the user.
   * delets the data and closes the producers.
   */
  async disconnectUser(
    sessionId: string,
    userId: string
  ): Promise<string[] | []> {
    const room = this.rooms[sessionId];
    if (!room || !userId) return [];
    const deletedProducerIds: string[] = [];
    // Close all producers owned by this user
    Object.entries(room.producers).forEach(([producerId, producer]) => {
      if (room.producerMetadata[producerId].userId === userId) {
        producer.close();
        delete room.producers[producerId];
        delete room.producerMetadata[producerId];
        deletedProducerIds.push(producerId);
      }
    });

    // Close transports (if stored)
    Object.entries(room.producerTransports || {}).forEach(
      ([transportId, transport]) => {
        if (transport.appData?.userId === userId) {
          transport.close();
          delete room.producerTransports[transportId];
        }
      }
    );

    Object.entries(room.consumerTransports || {}).forEach(
      ([transportId, transport]) => {
        if (transport.appData?.userId === userId) {
          transport.close();
          delete room.consumerTransports[transportId];
        }
      }
    );

    return deletedProducerIds;
  }

  async cleanupRoom(sessionId: string, socketId: string) {
    const room = this.rooms[sessionId];
    if (!room) return;

    // Close transports, producers, and consumers tied to this socket
    for (const [id, transport] of Object.entries(room.producerTransports)) {
      transport.close();
      delete room.producerTransports[id];
    }
    for (const [id, transport] of Object.entries(room.consumerTransports)) {
      transport.close();
      delete room.consumerTransports[id];
    }
    for (const [id, producer] of Object.entries(room.producers)) {
      producer.close();
      delete room.producers[id];
    }
    for (const [id, consumer] of Object.entries(room.consumers)) {
      consumer.close();
      delete room.consumers[id];
    }

    if (
      Object.keys(room.producerTransports).length === 0 &&
      Object.keys(room.consumerTransports).length === 0
    ) {
      room.router.close();
      delete this.rooms[sessionId];
    }
  }
}

export const mediasoupManager = new MediasoupManager();
