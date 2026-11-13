import express from "express";
import pool from "../utils/db.js";

const router= express.Router();


router.get("/", async (req,res)=>{
    let sql= `SELECT filmek.id, filmek.cim, filmek.hossz, filmek.korhatar, COUNT(DISTINCT vetitesek.id) AS vetites_db, COUNT(foglalasok.id) FROM filmek
                LEFT JOIN vetitesek ON filmek.id = vetitesek.film_id
                LEFT JOIN foglalasok ON vetitesek.id = foglalasok.vetites_id
                GROUP BY filmek.id`;

    const [eredmeny]= await pool.query(sql);
    return res.json(eredmeny);
})


router.get("/:id", async (req,res)=>{
    const id = Number(req.params.id);
    if(Number.isInteger(id)){
        let sql1= `SELECT filmek.id, filmek.cim, filmek.hossz, filmek.korhatar FROM filmek WHERE filmek.id=?`
        const [film]= await pool.query(sql1,id);
        if (film.length==0){
            return res.sendStatus(404);
        }
        else{
            let sql2= `SELECT vetitesek.id,termek.nev, vetitesek.kezdes, vetitesek.jegyar, (termek.sorok * termek.szekek) - COUNT(foglalasok.id) AS szabad_helyek FROM vetitesek
                        JOIN termek ON vetitesek.terem_id= termek.id
                        LEFT JOIN foglalasok ON vetitesek.id = foglalasok.vetites_id
                        WHERE vetitesek.film_id=?
                        GROUP BY vetitesek.id`;
            const [vetitesek] = await pool.query(sql2,id);

            if(vetitesek.length==0){
                return res.json({
                    film: film,
                    vetitesek:[]
                })
            }
            else{
                return res.json({
                    film: film,
                    vetitesek:vetitesek
                })
            }
        }
    }
    else{
        return res.sendStatus(400);
    }
})

export default router