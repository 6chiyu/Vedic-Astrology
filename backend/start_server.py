#!/usr/bin/env python
import uvicorn
import sys

if __name__ == "__main__":
    print("🚀 Starting Vedic Light Backend...")
    print(f"📝 Python: {sys.version}")
    
    try:
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped.")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

