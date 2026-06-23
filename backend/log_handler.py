import logging
from functools import wraps

def handle_logs():
    letest = "latestlog.txt"
    previous = "previouslog.txt"
    
    if os.path.exists(latest):
        if os.path.exists(previous):
            os.remove(previous)
        shutil.move(latest, previous)
    open(latest, 'w').close()
    
    
def log_and_guard(func):
    @wraps(func)
    def handler(*args, **kwargs):
        try:
            return func(*args, **kwargs)
                
        except Exception as e:
            logging.error(f"Error in {func.__name__}: {e}")
            return None
            
        return wrapper