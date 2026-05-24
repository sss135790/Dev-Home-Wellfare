from dotenv import load_dotenv
import os
import redis

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

if not REDIS_URL:
    raise Exception("REDIS_URL not found in .env")

redis_client = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
    ssl_cert_reqs=None
)