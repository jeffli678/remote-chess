import logging
import os

LOG_FILE = 'log.txt'

def init_logging():

    # see https://stackoverflow.com/questions/30861524/\
    # logging-basicconfig-not-creating-log-file-when-i-run-in-pycharm
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    log_full_path = os.path.join(os.getcwd(), LOG_FILE)

    logging.basicConfig(filename = log_full_path,
        format = '%(asctime)s %(message)s',
        datefmt = '%m/%d/%Y %H:%M:%S', 
        level = logging.INFO
        )

    log('init logging, log file at: %s' % log_full_path)

def log(message):
    logging.info(message)
    print(message)

init_logging()