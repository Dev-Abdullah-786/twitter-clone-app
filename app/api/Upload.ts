import fs from "fs";
import User from "../models/User";
import multiparty from "multiparty";
import S3 from "aws-sdk/clients/s3";
import { initMongoose } from "../lib/mongoose";
import { unstable_getServerSession } from "next-auth";
import { authOptions, UserWithId } from "../lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await initMongoose();

  const session = await unstable_getServerSession(req, res, authOptions);

  const s3Client = new S3({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    },
  });

  const form = new multiparty.Form();

  form.parse(
    req,
    async (
      err: Error | null,
      fields: Record<string, string[] | undefined>,
      files: Record<string, multiparty.File[] | undefined>,
    ) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const type = Object.keys(files)[0];
      const fileArray = files[type];

      if (!fileArray || fileArray.length === 0) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileInfo = fileArray[0];

      const filename = fileInfo.path.split("/").slice(-1)[0];

      s3Client.upload(
        {
          Bucket: "dawid-twitter-clone",
          Body: fs.readFileSync(fileInfo.path),
          ACL: "public-read",
          Key: filename,
          ContentType: fileInfo.headers["content-type"],
        },
        async (err: Error | null, data: S3.ManagedUpload.SendData) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (type === "cover" || type === "image") {
            await User.findByIdAndUpdate((session?.user as UserWithId).id, {
              [type]: data.Location,
            });
          }

          fs.unlinkSync(fileInfo.path);

          res.json({
            files,
            data,
            fileInfo,
            src: data.Location,
          });
        },
      );
    },
  );
}

export const config = {
  api: {
    bodyParser: false,
  },
};
