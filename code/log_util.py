import logging

LOG_FILE = 'log.txt'
logging.basicConfig(filename = LOG_FILE,
        format = '%(asctime)s %(message)s',
        datefmt='%m/%d/%Y %I:%M:%S %p', 
        level = logging.INFO)
