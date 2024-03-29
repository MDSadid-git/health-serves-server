const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdmrdur.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const appointmentServesCollection = client
      .db("healthServes")
      .collection("appointmentserves");
    const appointmentBookingCollection = client
      .db("healthServes")
      .collection("booking");

    // appointmentServesCollection All Data
    app.get("/appointmentserves", async (req, res) => {
      const date = req.query.date;
      const query = {};
      const bookingDate = { appointmentDate: date };
      const allOptions = await appointmentServesCollection
        .find(query)
        .toArray();
      const alreadyBooked = await appointmentBookingCollection
        .find(bookingDate)
        .toArray();

      allOptions.map((option) => {
        const optionBooked = alreadyBooked.filter(
          (book) => book.treatment === option.name
        );
        const slotsBooked = optionBooked.map((book) => book.slot);
        const remaingSlots = option.slots.filter(
          (slot) => !slotsBooked.includes(slot)
        );
        option.slots = remaingSlots;
        // console.log(date, option.name, remaingSlots.length);
      });
      res.send(allOptions);
    });

    // booking All Data
    app.get("/booking", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const reslut = await appointmentBookingCollection.find(query).toArray();
      res.send(reslut);
    });
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const query = {
        appointmentDate: booking.appointmentDate,
        email: booking.email,
        treatment: booking.treatment,
      };
      const alreadyBooked = await appointmentBookingCollection
        .find(query)
        .toArray();
      if (alreadyBooked.length) {
        const message = `You already have a booking on ${booking.appointmentDate}`;
        return res.send({ acknowledged: false, message });
      }
      const result = await appointmentBookingCollection.insertOne(booking);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log("error"));

app.get("/", async (req, res) => {
  res.send("Health Serves Is Running");
});
app.listen(port, () => {
  console.log(`Health Serves Is Running ${port}`);
});
