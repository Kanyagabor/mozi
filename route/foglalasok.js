import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.post("/", async (req,res)=>{
    if(Object.keys(req.body).length==0){
        return res.sendStatus(400);
    }
    else{
        const{vetitesId,nev,sor,szek}= req.body;
        let foglaltsql= `SELECT foglalasok.id FROM foglalasok WHERE foglalasok.vetites_id=? AND foglalasok.nev=? AND foglalasok.sor=? AND foglalasok.szek=?`;
        const [eredmeny] = await pool.query(foglaltsql,[vetitesId,nev,sor,szek]);
        if(eredmeny.length==0){
            let insertsql=`INSERT INTO foglalasok (foglalasok.vetites_id, foglalasok.nev,foglalasok.sor, foglalasok.szek) VALUES (?,?,?,?)`;
            await pool.query(insertsql, [vetitesId,nev,sor,szek]);
            return res.sendStatus(201)
        }
        else{
            let szabadhelysql=`SELECT (termek.sorok * termek.szekek) - COUNT(foglalasok.id) AS szabadhely
                                FROM foglalasok
                                INNER JOIN vetitesek ON foglalasok.vetites_id= vetitesek.id
                                INNER JOIN termek ON vetitesek.terem_id= termek.id
                                WHERE foglalasok.vetites_id = ?`;
            const [szabadhelyek]= await pool.query(szabadhelysql, vetitesId);
            if(szabadhelyek.szabadhely == 0){
                res.status(409).json("telt ház van");
            }
            else{
                res.status(409).json("foglalt a szék");
            }
        }
    }
})
export default router