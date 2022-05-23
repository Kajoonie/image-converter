#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use image::{self, imageops::FilterType::Triangle, DynamicImage, ImageError, ImageFormat};
use serde::{Deserialize, Serialize};
use std::{fs, io::Error};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_img])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize, Deserialize, Debug)]
struct Dimensions {
    width: u32,
    height: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Options {
    filename: String,
    buffer: Vec<u8>,
    format: String,
    grayscale: bool,
    scale: Dimensions,
}

#[tauri::command]
async fn save_img(options: Options) -> Result<String, String> {
    let image = grayscale_or_color(&options);

    let image = match image {
        Some(img) => img,
        None => {
            return Err(String::from("Unable to parse image"));
        }
    };

    let format = format_from_mime_type(&options.format);

    let filename = filename_from_options(&options, &format);

    let res = save(image, filename, format, options.scale);

    match res {
        Ok(_) => Ok(String::from("Good")),
        Err(e) => Err(String::from(format!("{}", e))),
    }
}

fn grayscale_or_color(options: &Options) -> Option<DynamicImage> {
    let image = image::load_from_memory(&options.buffer);

    if let Ok(image) = image {
        if options.grayscale {
            return Some(image.grayscale());
        } else {
            return Some(image);
        }
    }

    None
}

fn format_from_mime_type(mime_type: &str) -> ImageFormat {
    let format = ImageFormat::from_mime_type(mime_type);

    match format {
        Some(format) => format,
        None => ImageFormat::Png,
    }
}

fn filename_from_options(options: &Options, format: &ImageFormat) -> String {
    create_needed_dirs(&options.filename);

    let mut filename = starting_file_name(&options.filename);

    if options.grayscale {
        filename.push_str("_grayscale");
    }

    let width = options.scale.width;
    if width > 0 {
        filename.push_str("_w");
        filename.push_str(&width.to_string());
    }

    let height = options.scale.height;
    if height > 0 {
        filename.push_str("_h");
        filename.push_str(&height.to_string());
    }

    filename.push('.');
    filename.push_str(format.extensions_str()[0]);

    filename
}

fn create_needed_dirs(filename: &str) -> Result<(), Error> {

    let mut path = String::new();

    let mut count = filename.matches("/").count();
    for c in filename.chars() {
        path.push(c);
        if c == '/' {
            count -= 1;
            if count == 0 {
                break;
            }
        }
    }

    fs::create_dir(path)
}

fn starting_file_name(filename: &str) -> String {
    let mut starting_filename = String::new();

    let mut count = filename.matches(".").count();
    for c in filename.chars() {
        if c == '.' {
            count -= 1;
            if count == 0 {
                break;
            }
        }
        starting_filename.push(c);
    }

    starting_filename
}

fn save(
    image: DynamicImage,
    filename: String,
    format: ImageFormat,
    scale: Dimensions,
) -> Result<(), ImageError> {
    let nwidth = scale.width;
    let nheight = scale.height;

    let saving_img;
    if nwidth > 0 && nheight > 0 {
        let filter = Triangle;
        saving_img = image.resize(nwidth, nheight, filter);
    } else {
        saving_img = image;
    }

    saving_img.save_with_format(filename, format)
}
