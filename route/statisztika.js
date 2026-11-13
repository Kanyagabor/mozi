import express from "express";
import pool from "../utils/db.js";

const router= express.Router();


router.get("/filmek", async(req,res)=>{
    let sql=`SELECT 
            filmek.cim AS film,
            COALESCE(SUM(v_stat.eladottJegy), 0) AS eladottJegy,
            COALESCE(SUM(v_stat.bevetel), 0) AS bevetel,
            ROUND(SUM(v_stat.eladottJegy) / SUM(v_stat.kapacitas) * 100, 1) AS telitettseg
            FROM filmek
            LEFT JOIN (
            SELECT 
            vetitesek.film_id,
            COUNT(foglalasok.id) AS eladottJegy,
            COUNT(foglalasok.id) * vetitesek.jegyar AS bevetel,
            (termek.sorok * termek.szekek) AS kapacitas
            FROM vetitesek
            JOIN termek ON vetitesek.terem_id = termek.id
            LEFT JOIN foglalasok ON vetitesek.id = foglalasok.vetites_id
            GROUP BY vetitesek.id, vetitesek.film_id, vetitesek.jegyar, termek.sorok, termek.szekek
            ) AS v_stat ON filmek.id = v_stat.film_id
            GROUP BY filmek.id, filmek.cim
            ORDER BY bevetel DESC, filmek.cim ASC`;
    const [eredmeny]= await pool.query(sql);
    const formazott = eredmeny.map(sor => ({
        film: sor.film,
        eladottJegy: Number(sor.eladottJegy),
        bevetel: Number(sor.bevetel),
        telitettseg: sor.telitettseg !== null ? Number(sor.telitettseg) : null
    }));
    return res.json(formazott);
})

export default router