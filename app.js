const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cron = require("node-cron");
const mongoose = require("mongoose");

const app = express();
const dotenv = require("dotenv");
dotenv.config();
app.use(cors());


const API_URL = process.env.API_URL
const key = process.env.key
const DB_URL = process.env.DATABASE_URL
const PORT = process.env.PORT

mongoose.set("strictQuery", false);
// Connect to the database
mongoose.connect(`${DB_URL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// Define the air quality data schema
const airQualityDataSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  data: {}
});

// Create a model from the schema
const AirQualityData = mongoose.model("AirQualityData", airQualityDataSchema);
app.get("/air-quality", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const response = await axios.get(`${API_URL}?lat=${lat}&lon=${lon}&key=${key}`);
    res.json({"result":Object.entries(response.data.data.current)[0]});

    // Schedule the CRON job to run every minute
    cron.schedule("* * * * *", async () => {  
        // Save the air quality data in the database
        const airQualityData = new AirQualityData({
          data: response.data
        });
        airQualityData.save();
      
    });
      } catch (error) {
        
        res.status(500).send({ error: error});
      }
});





app.listen(PORT, () => console.log(`App s'execute sur le port ${PORT}`));