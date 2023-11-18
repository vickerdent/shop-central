from django_backblaze_b2 import BackblazeB2Storage
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys

class MediaStorage(BackblazeB2Storage):
    bucket_name = "shop-central"


def delete_image(file_path):
    """Delete Previous Image OF USER
      from storage"""

    # instantiate storage class to use
    prev_img = MediaStorage()
    
    # check functions before usage
    if prev_img.exists(file_path):
        prev_img.delete(file_path)

def compress_image(image):
    """Crop and compress profile image 
    of users or products, or even anything before uploading"""

    # Instantiate Image file
    new_image = Image.open(image)

    # Get size of original image
    width, height = new_image.size
    
    offset = int(abs(height-width)/2)
    
    # Crop image using given offset, if needed
    if width == height:
        cropped_image = new_image
    elif width > height:
        cropped_image = new_image.crop((offset, (0), (width-offset), (height)))
    else:
        cropped_image = new_image.crop((0, offset, width, height-offset))

    #Convert to JPG if PNG, or maintain JPG if already so
    if image.name.endswith(".png"):
        fin_resize = cropped_image.convert("RGB")
    else:
        fin_resize = cropped_image

    # Now, resize image
    base_width, base_height = fin_resize.size

    new_size = (base_width//4, base_height//4)

    end_image = fin_resize.resize(new_size)

    # Create a separate BytesIO object
    new_image_IO = BytesIO()

    # Save image to BytesIO object

    end_image.save(new_image_IO, format="JPEG", optimize=True, quality=80)

    new_image_IO.seek(0) # So that the next read starts at the beginning
    
    # Create Django-friendly Files object, probably
    compressed_image = InMemoryUploadedFile(new_image_IO, "ImageField", image.name, 
                                            "image/jpg", sys.getsizeof(new_image_IO), None)
    return compressed_image

def handle_user_image(image):
    """Upload image to storage S3 bucket"""
    # Set file directory you want to save files to
    file_directory_in_bucket = "user_images/"

    # Synthesize (create) full file path, including filename
    file_path_in_bucket = file_directory_in_bucket + image.name

    # Instantiate bucket
    media_storage = MediaStorage()
    st_file_path = media_storage.path(file_path_in_bucket)

    media_storage.save(st_file_path, image)
    image_url = media_storage.url(st_file_path)

    # # For development purposes only
    # with open("media/book_images/" + image.name, "wb+") as destination:
    #     for chunk in image.chunks():
    #         destination.write(chunk)
    return image_url, st_file_path

def handle_product_image(image):
    """Upload image to storage S3 bucket"""
    # Set file directory you want to save files to
    file_directory_in_bucket = "product_images/"

    # Synthesize (create) full file path, including filename
    file_path_in_bucket = file_directory_in_bucket + image.name

    # Instantiate bucket
    media_storage = MediaStorage()
    st_file_path = media_storage.path(file_path_in_bucket)

    media_storage.save(st_file_path, image)
    image_url = media_storage.url(st_file_path)

    # # For development purposes only
    # with open("media/book_images/" + image.name, "wb+") as destination:
    #     for chunk in image.chunks():
    #         destination.write(chunk)
    return image_url, st_file_path

def default_user_image():
    """
    Function to use a default image for
    new users
    """
    profile_pic = MediaStorage()

    # Check to ensure image exists
    if profile_pic.exists("app_defaults/user_frame.png"):
        # Get the file url
        the_path = profile_pic.path("app_defaults/user_frame.png")
        pic_url = profile_pic.url(the_path)
        
        return pic_url, the_path
    
def default_bulk_image():
    """
    Function to use a default image for
    bulk of products
    """
    profile_pic = MediaStorage()

    # Check to ensure image exists
    if profile_pic.exists("app_defaults/bulk_frame.png"):
        # Get the file url
        the_path = profile_pic.path("app_defaults/bulk_frame.png")
        pic_url = profile_pic.url(the_path)
        
        return pic_url, the_path

def default_carton_image():
    """
    Function to use a default image for
    cartons of products
    """
    profile_pic = MediaStorage()

    # Check to ensure image exists
    if profile_pic.exists("app_defaults/carton_frame.png"):
        # Get the file url
        the_path = profile_pic.path("app_defaults/carton_frame.png")
        pic_url = profile_pic.url(the_path)
        
        return pic_url, the_path

def default_bag_image():
    """
    Function to use a default image for
    bags of products
    """
    profile_pic = MediaStorage()

    # Check to ensure image exists
    if profile_pic.exists("app_defaults/bag_frame.png"):
        # Get the file url
        the_path = profile_pic.path("app_defaults/bag_frame.png")
        pic_url = profile_pic.url(the_path)
        
        return pic_url, the_path

def edit_image_in_bucket(file_path, username):

    """Function to edit the name of file inside an S3 bucket
    Note that this is only done if one is changing username"""
    media_storage = MediaStorage()

    # Check to ensure image exists
    if media_storage.exists(file_path):
        # Get the file object
        the_image = media_storage.open(file_path, mode='rb')
        slash = file_path.rfind("/")

        # determine the directory of file
        directory = file_path[:slash+1]

        # Change name of file
        curr_image = file_path[slash+1:]
        image_dot = curr_image.rfind(".")
        image_ext = curr_image[image_dot:]
        new_image = username + image_ext

        # Create file path with new name and save new image with new file_path
        new_file_path = directory + new_image
        media_storage.save(new_file_path, the_image)
        image_url = media_storage.url(new_file_path)

        return image_url, new_file_path

def change_image_name(image, new_name: str):
    """ Use to change name of image to
    given new_name
    """
    image_dot = str(image.name).rfind(".")
    
    # Include the dot, and give the whole extension
    image_ext = image.name[image_dot:]
    return str(new_name) + str(image_ext)
