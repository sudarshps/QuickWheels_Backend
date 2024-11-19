import multer from 'multer'
const storage = multer.memoryStorage()
const upload = multer({storage:storage})

import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'


export const uploadToS3 = async (file:any,bucketName:string,fileName:string,fileType:string):Promise<any>=> {
    try {
        let client = new S3Client({
            region:process.env.AWS_REGION,
            credentials:{
                accessKeyId:process.env.AWS_ACCESS_KEY as string,
                secretAccessKey:process.env.AWS_SECRET as string
            }
        })

        const upload = new Upload({
            client,
            params:{
                Bucket:bucketName,
                Key:fileName,
                Body:file,
                ContentType:fileType,
                CacheControl:'no-cache, no-store, must-revalidate'
            }
        }) 

        const uploadImage = await upload.done()        

        if(!uploadImage){
            return{
                message:'File upload failed'
              }
        }

        return uploadImage.Location
        

    } catch (error) {
        return error
    }
}


export default upload
