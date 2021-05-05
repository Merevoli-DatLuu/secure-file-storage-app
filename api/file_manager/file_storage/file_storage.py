from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import mimetypes
import logging
import pathlib

BASE_DIR = str(pathlib.Path(__file__).parent.absolute())
LOG_PATH = BASE_DIR + '/../app.log'
CREDENTIALS_PATH = BASE_DIR + '/mycreds.txt'

logging.basicConfig(filename=LOG_PATH, filemode='a', format='- %(levelname)s - %(asctime)s - %(message)s', level = logging.INFO)

"""
gauth = GoogleAuth()
# gauth.LocalWebserverAuth()
gauth.LoadCredentialsFile("mycreds.txt")
# gauth.SaveCredentialsFile("mycreds.txt")
drive = GoogleDrive(gauth)
"""


"""
API USECASE

Ref: https://github.com/nguyenhuuhai98/django-rest-framework
register    -   api/register    -   POST
login       -   api/login       -   POST

sync to server - api/files (create), api/files/<id> (modified) - POST, PUT, DELETE
	+ upload file   -   api/files       -   POST
	+ modified file -   api/files/<id>  -   PUT
	+ delete file   -   api/files/<id>  -   DELETE
sync to device - api/files - GET

when sync to server
    + Add file
    + Modified File
    + Delete File

when sync to device
    + another host sync to server: check sync (time = 5s)
    + login to account

sending key problem
+ use 1 key for timelife when login device
+ store key in secret file (local)
+ check key

sync data problem
+ solution: when multy device modified data -> choose the last one is root
"""

class FileStorage():

    def __init__(self):
        self.gauth = gauth = GoogleAuth()
        self.CREDENTIALS_FILE = CREDENTIALS_PATH
        self.gauth.LoadCredentialsFile(self.CREDENTIALS_FILE)
        self.drive = GoogleDrive(gauth)
        logging.info('Init Server')

    def upload_file(self, file_name, file_content):
        file = self.drive.CreateFile({'title': file_name})
        file.SetContentString(file_content)
        file.Upload()
        logging.info(f'{self.upload_file.__name__} -> (file_name: {file_name}, file_content: {file_content[:50]})')

    def upload_file_with_path(self, file_path):
        file_name = file_path.split('/')[-1]
        file = self.drive.CreateFile({'title': file_name})
        file.content = open(file_path, 'rb')
        if file.get('mimeType') is None:
            file['mimeType'] = mimetypes.guess_type(file_path)[0]
        file.Upload()
        logging.info(f'{self.upload_file.__name__} -> (file_name: {file_name})')

    def upload_file_with_path_in_specific_folder(self, file_path, folder_name):
        file_name = file_path.split('/')[-1]
        file = self.drive.CreateFile({'title': file_name, 'parents': [{'id': self.get_folder_id(folder_name)}]})
        file.content = open(file_path, 'rb')
        if file.get('mimeType') is None:
            file['mimeType'] = mimetypes.guess_type(file_path)[0]
        file.Upload()
        logging.info(f'{self.upload_file.__name__} -> (file_name: {file_name})')

    def create_folder(self, folder_name):
        folder = self.drive.CreateFile({'title' : folder_name, 'mimeType' : 'application/vnd.google-apps.folder'})
        folder.Upload()

    def get_folder_id(self, folder_name):

        folders = self.drive.ListFile(
            {'q': "title='" + folder_name + "' and mimeType='application/vnd.google-apps.folder' and trashed=false"}).GetList()
        if len(folders) == 0:
            print("ERROR")
        else:
            return folders[0]['id']

    def download_file(self, file, file_path):
        file.GetContentFile(file_path)
        logging.info(f'{self.download_file.__name__} -> (file_name: {file_path})')


    def change_title_file(self, file, new_title):
        file['title'] = new_title 
        file.Upload()
        logging.info(f'{self.change_title_file.__name__} -> (file: {file["id"]} - {file["title"]}, new_title: {new_title})')

    def get_content_file(self, file):
        logging.info(f'{self.get_content_file.__name__} -> (file : {file["id"]} - {file["title"]})')
        return file.GetContentString()

    def change_content_file(self, file, new_content):
        file.SetContentString(new_content) 
        file.Upload() 
        logging.info(f'{self.change_content_file.__name__} -> (file: {file["id"]} - {file["title"]}, appended_content: {new_content[:50]})')

    def append_content_file(self, file, appended_content):
        content = file.GetContentString()
        file.SetContentString(content + appended_content) 
        file.Upload() 
        logging.info(f'{self.append_content_file.__name__} -> (file: {file["id"]} - {file["title"]}, appended_content: {appended_content})')

    def get_file_list(self):
        file_list = self.drive.ListFile({'q': "'root' in parents"}).GetList()
        logging.info(f'{self.get_file_list.__name__}')
        return file_list

    def get_file_list_in_specific_folder(self, folder_name):
        file_list = self.drive.ListFile({'q': f"'{self.get_folder_id(folder_name)}' in parents"}).GetList()
        logging.info(f'{self.get_file_list.__name__}')
        return file_list

    def get_files_by_title(self, title):
        file_list = self.drive.ListFile({'q': f"title = '{title}'"}).GetList()
        logging.info(f'{self.get_files_by_title.__name__} -> (title: {title})')
        return file_list

    def get_file_by_id(self, file_id):
        # result_file = self.drive.ListFile({'q': f"id = '{file_id}'"}).GetList()
        result_file = self.drive.CreateFile({'id': file_id})
        if (len(result_file) > 0):
            logging.info(f'{self.get_file_by_id.__name__} -> (file_id: {file_id})')
            return result_file
        else:
            logging.warning(f'{self.get_file_by_id.__name__} -> (file_id: {file_id})')
            return None

    def delete_file(self, file):
        file.Trash()
        logging.info(f'{self.delete_file.__name__} -> (file: {file["id"]} - {file["title"]})')
    
    def delete_file_by_id(self, file_id):
        file = self.get_file_by_id(file_id)
        if file is not None:
            file.Trash()
            logging.info(f'{self.delete_file_by_id.__name__} -> (file_id: {file_id})')
        else:
            logging.warning(f'{self.delete_file_by_id.__name__} -> (file_id: {file_id})')
            return None

if __name__ == "__main__":
    file_storage = FileStorage()
