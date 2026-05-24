#!/usr/bin/env python
import traceback
import uvicorn

print("🚀 Starting Vedic Light Backend test...")

try:
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="debug"
    )
except Exception as e:
    print(f"\n❌ Error starting server: {type(e).__name__}: {e}")
    print("\n📜 Stack trace:")
    traceback.print_exc()
