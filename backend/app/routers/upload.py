import os
import boto3
from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_REGION", "ap-southeast-1")

if aws_access_key and aws_secret_key:
    s3 = boto3.client(
        "s3",
        region_name=aws_region,
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key
    )
else:
    s3 = boto3.client(
        "s3",
        region_name=aws_region
    )

BUCKET_NAME = os.getenv("S3_BUCKET", "fastapi-app-files-069916201087")


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        s3.upload_fileobj(file.file, BUCKET_NAME, file.filename)
        return {
            "message": "Upload thanh cong",
            "filename": file.filename,
            "bucket": BUCKET_NAME
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
