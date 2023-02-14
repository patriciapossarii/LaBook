import { PostDatabase } from "../database/PostDatabase"
import { CreatePostInputDTO, DeletePostInputDTO, EditPostInputDTO, GetPostsInputDTO, PostDTO } from "../dto/PostDTO"
import { PostWithUser } from "../types"
import { v4 as uuidv4 } from 'uuid';
import { PostDB } from "../types";
import { Post } from "../models/Post";
import { TPostRequest } from "../types";
import moment, { Moment } from 'moment'
import { UserDatabase } from "../database/UserDatabase";
import { BadRequestError } from "../erros/BadRequest";

export class PostBusiness {
    constructor(
        private postDTO: PostDTO,
        private postDatabase: PostDatabase
    ) { }

    public getPosts = async (input: GetPostsInputDTO) => {
        const { q } = input
        const result: PostWithUser[] = []
        const posts = await this.postDatabase.postUser(q)
        for (let post of posts) {
            let postWithUser: PostWithUser = {
                id: post.id,
                content: post.content,
                likes: post.likes,
                dislikes: post.dislikes,
                createdAt: post.createdAt,
                updatedAt: post.updateAt,
                creator: {
                    id: post.uid,
                    name: post.name
                }
            }
            result.push(postWithUser)
        }
        const output = this.postDTO.getPostOutput(result)
        return output
    }


    public createPost = async (input: CreatePostInputDTO) => {
        const { content,user } = input
        if (content.length < 2) {
            throw new BadRequestError("'content' do post inválido. Deve conter no mínimo 2 caracteres")
        }
        let myuuid = uuidv4()
     
        const newPost = new Post(
            myuuid,
            user,
            content,
        )
        const newPostDB: PostDB = {
            id: newPost.getId(),
            creator_id: newPost.getCreatorId(),
            content: newPost.getContent(),
            likes: newPost.getLikes(),
            dislikes: newPost.getDislikes(),
            created_at: newPost.getCreatedAt(),
            updated_at: newPost.getUpdatedAt()
        }
        await this.postDatabase.insertPost(newPostDB)
        const output = {
            message: "Post registrado com sucesso",
        }
        return output
    }


    public editPostById = async (input: EditPostInputDTO) => {
        const { idToEdit, newContent } = input
        if (newContent.length < 2) {
            throw new BadRequestError("'content' do post inválido. Deve conter no mínimo 2 caracteres")
        }
        const postToEditDB = await this.postDatabase.findPostById(idToEdit)
        if (!postToEditDB) {
            throw new BadRequestError("'id' para editar não existe")
        }
        var date = Date.now()
        let dateNow = (moment(date)).format('YYYY-MM-DD HH:mm:ss')
        const post = new Post(
            postToEditDB.id,
            postToEditDB.creator_id,
            newContent || postToEditDB.content,
            postToEditDB.likes,
            postToEditDB.dislikes,
            postToEditDB.created_at,
            dateNow
        )
        const updatePostDB: PostDB = {
            id: post.getId(),
            creator_id: post.getCreatorId(),
            content: post.getContent(),
            likes: post.getLikes(),
            dislikes: post.getDislikes(),
            created_at: post.getCreatedAt(),
            updated_at: post.getUpdatedAt()
        }
        await this.postDatabase.updatePost(updatePostDB)
        const output = {
            message: "Post editado com sucesso",
        }
        return output
    }


    public deletPostById = async (input: DeletePostInputDTO) => {
        const { idToDelet } = input          
        if(idToDelet === ":id"){
            throw new BadRequestError("'id' deve ser informado") 
        }    
        const postToDeletBD = await this.postDatabase.findPostById(idToDelet)
        if (!postToDeletBD) {
            throw new BadRequestError("'id' para deletar não existe")
        }
        await this.postDatabase.deletePostById(postToDeletBD.id)
        const output = {
            message: "Post deletado com sucesso"
        }
        return output
    }


    public likeDislike = async (input: any) => {
        const { id, newLike, user } = input

        const postDatabase = new PostDatabase()
        const userDatabase = new UserDatabase()

        const userExistDB = await userDatabase.findUserById(user)
        if (!userExistDB) {
            throw new Error("'id' do usuário não existe")
        }


        const postExistDB = await postDatabase.findPostById(id)
        if (!postExistDB) {
            throw new Error("'id' do post não existe")
        }




        if (newLike !== undefined) {
            if (typeof newLike !== "boolean") {

                throw new Error("'like' do post deve ser boolean (true ou false).")
            }
        }
        /*
                    let likeBD = 0
                    if (newLike === true) {
                        likeBD = 1
                    } 
        */
        const checkLikePost = await postDatabase.checkPostWithLike(user, id)
        console.log(checkLikePost)


        const post = new Post(
            postExistDB.id,
            postExistDB.creator_id,
            postExistDB.content,
            postExistDB.likes || newLike,
            postExistDB.dislikes,
            postExistDB.created_at,
            postExistDB.updated_at
        )



        const updatePostDB: PostDB = {
            id: post.getId(),
            creator_id: post.getCreatorId(),
            content: post.getContent(),
            likes: post.getLikes(),
            dislikes: post.getDislikes(),
            created_at: post.getCreatedAt(),
            updated_at: post.getUpdatedAt()
        }

        await postDatabase.updatePost(updatePostDB)

        const output = {
            message: "Like editado com sucesso",
            result: checkLikePost
        }
        return output
    }

}