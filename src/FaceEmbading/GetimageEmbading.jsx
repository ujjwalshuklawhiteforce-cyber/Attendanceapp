import net from "react-native-tcp-socket";

export default async function getImageEmbedding(imageUri) 
{
  return new Promise(async (resolve, reject) => {
    const filePath = imageUri.replace("file://", "");
    console.log(filePath);

    try 
    {
      const payload = {
        type: "getEmbedding",       
        input_ids: [0],
        filePath: [filePath],                 
        attention_mask: [1]             
      };

      const client = net.createConnection({ port: 54321, host: "127.0.0.1" }, () => {
        console.log("✅ Connected to EmbeddingService!");
        client.write(JSON.stringify(payload) + "\n");
      });

      client.setEncoding("utf8");

      client.on("data", (data) => {
        console.log("📩 From service:", data.toString());
        client.destroy();
        try {
          const json = JSON.parse(data.toString());

          if (json.type === "embedding") {
            const arr = Array.isArray(json.data)
              ? json.data
              : json.data.split(",").map(Number);
            resolve(new Float32Array(arr));
          } else {
            reject(new Error("Invalid response from service"));
          }
        } catch (err) {
          console.error("❌ Error parsing response:", err);
          reject(err);
        }
      });

      client.on("error", (err) => {
        console.log("❌ Socket error", err);
        reject(err);
      });

      client.on("close", () => {
        console.log("🔌 Connection closed");
      });
    } catch (err) {
      console.error("❌ Failed to get embedding:", err);
      reject(err);
    }
  });
}