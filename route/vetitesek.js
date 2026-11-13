import express from "express";
import pool from "../utils/db.js";



const router = express.Router();


router.get("/", async (req, res)=>{
    if(Object.keys(req.query).length==0){
        return res.sendStatus(400);
    }
    else{
        const datum= req.query.datum;
        if(datum){
            let sql = `SELECT 
                        vetitesek.id,
                        filmek.cim AS film,
                        termek.nev AS terem,
                        DATE_FORMAT(vetitesek.kezdes, '%Y-%m-%d %H:%i') AS kezdes,
                        DATE_FORMAT(DATE_ADD(vetitesek.kezdes, INTERVAL filmek.hossz MINUTE), '%H:%i') AS veg,
                        vetitesek.jegyar,
                        (termek.sorok * termek.szekek) - COUNT(foglalasok.id) AS szabadHely
                        FROM vetitesek
                        JOIN filmek ON vetitesek.film_id = filmek.id
                        JOIN termek ON vetitesek.terem_id = termek.id
                        LEFT JOIN foglalasok ON vetitesek.id = foglalasok.vetites_id
                        WHERE DATE(vetitesek.kezdes) = ?
                        GROUP BY vetitesek.id
                        ORDER BY vetitesek.kezdes ASC;`;
            const [eredmeny]= await pool.query(sql,datum);
            if(eredmeny.length==0){
                return res.sendStatus(404);
            }
            else{return res.json(eredmeny);}
        }
        else{return res.sendStatus(400);}
    }
})



router.get("/:id", async (req,res)=>{
    const id = Number(req.params.id);
    if(Number.isInteger(id)){
        let sql1= `SELECT vetitesek.id, filmek.cim, termek.nev, DATE_FORMAT(vetitesek.kezdes, '%Y-%m-%d %H:%i') AS kezdes, vetitesek.jegyar, termek.sorok, termek.szekek, COUNT(foglalasok.id)AS foglalthelyek, 
                    (termek.sorok * termek.szekek) - COUNT(foglalasok.id) AS szabadHely
                    FROM vetitesek
                    JOIN filmek ON vetitesek.film_id =filmek.id
                    JOIN termek ON vetitesek.terem_id = termek.id
                    LEFT JOIN foglalasok ON vetitesek.id= foglalasok.vetites_id
                    WHERE vetitesek.id=?
                    GROUP BY vetitesek.id`;
        const [vetites]= await pool.query(sql1, id);
        if(vetites.length==0){
            res.sendStatus(404);
        }
        else{
            let sql2= `SELECT foglalasok.sor,foglalasok.szek
                        FROM vetitesek
                        JOIN filmek ON vetitesek.film_id =filmek.id
                        JOIN termek ON vetitesek.terem_id = termek.id
                        LEFT JOIN foglalasok ON vetitesek.id= foglalasok.vetites_id
                        WHERE vetitesek.id=?
                        ORDER BY foglalasok.sor ASC, foglalasok.szek ASC`;
            const [szekek]= await pool.query(sql2, id);
            return res.json({
                vetítes:vetites,
                székek: szekek
            });
        }
    }
    else{return res.sendStatus(400);}
})


export default router