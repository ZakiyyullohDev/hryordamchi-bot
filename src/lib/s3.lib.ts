import S3Client from 's3-service-client'

import EnvLib from './env.lib'

const s3Login = EnvLib.getVariable('S3_LOGIN')
const s3Password = EnvLib.getVariable('S3_PASSWORD')

const S3 = S3Client({
    auth: {
        login: s3Login,
        password: s3Password,
    }
})

export default S3