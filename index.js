import express from "express";
import filmek from "./route/filmek.js";
import vetitesek from "./route/vetitesek.js";
import statisztika from "./route/statisztika.js";
import foglalasok from "./route/foglalasok.js";

const app= express();

app.use("/filmek", filmek);
app.use("/vetitesek", vetitesek);
app.use("/statisztika", statisztika);
app.use("/foglalas", foglalasok);






app.listen(3000, ()=>{
    console.log("http://localhost:3000")
})