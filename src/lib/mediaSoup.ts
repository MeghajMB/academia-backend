import * as mediasoup from "mediasoup";
import os from "os";

class MediasoupManager {
  public workers: mediasoup.types.Worker<mediasoup.types.AppData>[];
  public nextWorkerIndex: number;
  public rooms: {
    [roomId: string]: {
      router: mediasoup.types.Router<mediasoup.types.AppData>;
      consumerTransports: {
        [transportId: string]: mediasoup.types.WebRtcTransport;
      };
      producerTransports: {
        [transportId: string]: mediasoup.types.WebRtcTransport;
      };
      producers: { [producerId: string]: mediasoup.types.Producer };
      consumers: { [consumerId: string]: mediasoup.types.Consumer };
    };
  };

  constructor() {
    this.workers = [];
    this.nextWorkerIndex = 0;
    this.rooms = {};
    this.initializeWorkers();
  }
  //code to intialize worker for mediasoup
  private async initializeWorkers() {
    const numWorkers = Math.min(2, os.cpus().length); //os.cpus().length; // Use all CPU cores if using a seperate service
    console.log(`Spawning ${numWorkers} mediasoup workers...`);

    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: "warn",
        rtcMinPort: 20000,
        rtcMaxPort: 30000,
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

    const router = await worker.createRouter({
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
        },
      ],
    });

    this.rooms[roomId] = {
      router,
      consumerTransports: {},
      producerTransports: {},
      producers: {},
      consumers: {},
    };

    console.log(`Created new router for room: ${roomId}`);
    return router;
  }
  //code to generate transport for sender and reciever
  async createWebRtcTransport(
    gigId: string,
    senderOrConsumer: "sender" | "consumer"
  ) {
    const room = this.rooms[gigId];
    if (!room) {
      throw new Error(`Gig ${gigId} does not exist`);
    }
    const PUBLIC_IP = process.env.PUBLIC_IP || "127.0.0.1";
    const transport = await room.router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: PUBLIC_IP }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });
    if (senderOrConsumer == "sender") {
      this.rooms[gigId].producerTransports[transport.id] = transport;
    } else {
      this.rooms[gigId].consumerTransports[transport.id] = transport;
    }
    console.log(`Created WebRTC Transport for room: ${gigId}`);

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }
  //code to connect the producer transport
  async connectProducerTransport({
    gigId,
    transportId,
    dtlsParameters,
  }: {
    gigId: string;
    transportId: string;
    dtlsParameters: mediasoup.types.DtlsParameters;
  }) {
    await this.rooms[gigId].producerTransports[transportId].connect({
      dtlsParameters,
    });
    return { success: "success" };
  }
  /**
   * This function sets up a producer for sending media to the peer.
   * A producer represents the source of a single media track (audio or video).
   */
  async createProducer({
    gigId,
    transportId,
    kind,
    rtpParameters,
  }: {
    gigId: string;
    transportId: string;
    kind: mediasoup.types.MediaKind;
    rtpParameters: mediasoup.types.RtpParameters;
  }) {
    const transport = this.rooms[gigId].producerTransports[transportId]; // Get transport

    if (!transport) {
      throw new Error("Transport not found");
    }
    // Create a Producer instance
    const producer = await transport.produce({ kind, rtpParameters });

    producer?.on("transportclose", () => {
      console.log("Producer transport closed");
      producer?.close();
    });
    // Store the producer
    this.rooms[gigId].producers[producer.id] = producer;

    console.log(`Producer created: ${producer.id}, Kind: ${kind}`);

    // Return the producer ID to the client
    return { id: producer.id };
  }

  //code to create consumer
  async createConsumer({
    gigId,
    consumerTransportId,
    producerId,
    rtpCapabilities,
  }: {
    gigId: string;
    consumerTransportId: string;
    producerId: string;
    rtpCapabilities: mediasoup.types.RtpCapabilities;
  }) {
    const room = this.rooms[gigId];
    if (!room) throw new Error(`Room ${gigId} does not exist`);

    const producer = room.producers[producerId];
    if (!producer) throw new Error("Producer not found");

    if (!room.router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error("Cannot consume this producer");
    }
    console.log("THIS IS THE CONSUMER TRANSPORT",this.rooms[gigId].consumerTransports[
      consumerTransportId
    ])
    const consumer = await this.rooms[gigId].consumerTransports[
      consumerTransportId
    ].consume({
      producerId,
      rtpCapabilities,
      paused: producer?.kind === "video",
    });

    this.rooms[gigId].consumers[consumer.id] = consumer;
    return {
      id: consumer.id,
      producerId: consumer.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }
  /**
   * Event handler for connecting the receiving transport.
   * This step is required before the transport can be used to receive media.
   */
  async connectConsumer({
    gigId,
    transportId,
    dtlsParameters,
  }: {
    gigId: string;
    transportId: string;
    dtlsParameters: mediasoup.types.DtlsParameters;
  }) {
    const consumerTransport =
      this.rooms[gigId].consumerTransports[transportId];
    if (!consumerTransport) throw new Error("Transport not found");

    await consumerTransport.connect({ dtlsParameters });
    console.log(`Consumer transport ${transportId} connected`);
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
    await this.rooms[roomId].consumers[consumerId].pause();
  }
  async resumeConsumer({
    gigId,
    consumerId,
  }: {
    gigId: string;
    consumerId: string;
  }) {
    await this.rooms[gigId].consumers[consumerId].resume();
  }
  async cleanupRoom(gigId: string, socketId: string) {
    const room = this.rooms[gigId];
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
      delete this.rooms[gigId];
    }
  }
}

export default MediasoupManager;
