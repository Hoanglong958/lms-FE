import subprocess
import os
import sys
import threading
import time


def run_command(command, cwd, name):
    """Starts a subprocess and returns the process object."""
    print(f"[{name}] Starting command: {command}")
    try:
        # Use shell=True for Windows to handle batch files and npm commands correctly
        process = subprocess.Popen(
            command,
            cwd=cwd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        return process
    except Exception as e:
        print(f"[{name}] Error starting process: {e}")
        return None


def monitor_output(process, name):
    """Reads and prints output from a process."""
    if not process or not process.stdout:
        return
    try:
        for line in iter(process.stdout.readline, ""):
            if line:
                print(f"[{name}] {line.strip()}")
    except Exception as e:
        print(f"[{name}] Error reading output: {e}")
    finally:
        if process.stdout:
            process.stdout.close()


def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    be_dir = os.path.join(root_dir, "be")
    fe_dir = os.path.join(root_dir, "fe")

    be_cmd = "gradlew.bat bootRun"
    fe_cmd = "npm run dev"
    ai_cmd = "ollama serve"
    face_auth_cmd = "python face_auth_server.py"

    print("=" * 50)
    print("Unified Runner: React + Spring Boot + Face Auth")
    print("=" * 50)

    processes = []
    threads = []

    # ✅ Khai báo processes/threads trước, rồi mới dùng
    process_names = {}

    ai_process = run_command(ai_cmd, root_dir, "AI Model Server")
    if ai_process:
        processes.append(ai_process)
        process_names[ai_process.pid] = "AI Model Server"
        t = threading.Thread(target=monitor_output, args=(ai_process, "AI"), daemon=True)
        t.start()
        threads.append(t)

    face_auth_process = run_command(face_auth_cmd, root_dir, "Face Auth Server")
    if face_auth_process:
        processes.append(face_auth_process)
        process_names[face_auth_process.pid] = "Face Auth Server"
        t = threading.Thread(target=monitor_output, args=(face_auth_process, "Face Auth"), daemon=True)
        t.start()
        threads.append(t)

    be_process = run_command(be_cmd, be_dir, "Backend")
    if be_process:
        processes.append(be_process)
        process_names[be_process.pid] = "Backend"
        t = threading.Thread(target=monitor_output, args=(be_process, "Backend"), daemon=True)
        t.start()
        threads.append(t)

    fe_process = run_command(fe_cmd, fe_dir, "Frontend")
    if fe_process:
        processes.append(fe_process)
        process_names[fe_process.pid] = "Frontend"
        t = threading.Thread(target=monitor_output, args=(fe_process, "Frontend"), daemon=True)
        t.start()
        threads.append(t)

    if not processes:
        print("Failed to start processes. Exiting.")
        return

    print("\nAll processes are starting. Press Ctrl+C to stop.\n")

    try:
        while True:
            for p in processes:
                if p.poll() is not None:
                    name = process_names.get(p.pid, "Unknown")
                    print(f"\n[{name}] Process exited with code {p.poll()}")
                    raise KeyboardInterrupt
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping processes gracefully...")
    finally:
        for p in processes:
            if p.poll() is None:
                try:
                    subprocess.run(f"taskkill /F /T /PID {p.pid}", shell=True, capture_output=True)
                except:
                    p.terminate()
        print("All processes stopped.")


if __name__ == "__main__":
    main()
