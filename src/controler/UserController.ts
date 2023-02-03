import { User } from "../models/User";
import { UserDatabase } from "../database/UserDatabase";
import express, { Request, Response } from 'express'

export class UserController {
    public getUsers = async (req: Request, res: Response) => {
         try {
             const q = req.query.q as string | undefined
     
             const userDatabase = new UserDatabase()
             const usersDB = await userDatabase.findUsers(q)
     
             const users: User[] = usersDB.map((userDB) => new User(
                 userDB.id,
                 userDB.name,
                 userDB.email,
                 userDB.password,
                 userDB.role,
                 userDB.created_at
             ))
     
             res.status(200).send(users)
         } catch (error) {
             console.log(error)
     
             if (req.statusCode === 200) {
                 res.status(500)
             }
     
             if (error instanceof Error) {
                 res.send(error.message)
             } else {
                 res.send("Erro inesperado")
             }
         }
     }
 }