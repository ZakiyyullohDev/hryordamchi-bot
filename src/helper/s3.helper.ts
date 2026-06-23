import S3 from "@lib/s3.lib";

namespace S3Helper {
    export async function ImageRecieverById(imgId: string) {
        const image = await S3.direct.getFile({
            file_id: imgId
        });

        if (image.error) {
            return null;
        }

        return image.data;
    }
}

export default S3Helper;