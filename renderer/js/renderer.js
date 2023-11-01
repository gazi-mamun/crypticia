let filepath = "";
let filename = "";
let cThumbImgUrl = "";
let cThumbTitle = "";
let isThumbImg;
let outputData = null;
let outputFileType = null;
let processing = false;

const fileExtensions = {
  ai: "ai",
  avi: "avi",
  css: "css",
  csv: "csv",
  crypticia: "crypticia",
  doc: "doc",
  docx: "doc",
  exe: "exe",
  default: "file",
  html: "html",
  iso: "iso",
  js: "js",
  json: "json",
  mp3: "mp3",
  mp4: "mp4",
  pdf: "pdf",
  ppt: "ppt",
  pptx: "ppt",
  psd: "psd",
  svg: "svg",
  txt: "txt",
  xls: "xls",
  xlsx: "xls",
  xml: "xml",
  zip: "zip",
};

// drop zone
const dropZone = document.querySelector(".drop_zone");
const dropZoneInput = document.querySelector(".drop_zone_input");
const dropZonePrompt = document.querySelector(".drop_zone_prompt");
// file
const fileForm = document.querySelector(".file_form");
const fileCancelBtn = document.querySelector(".file_btn_cancel");
const fileSubmitBtn = document.querySelector(".file_btn_submit");
const password = document.getElementById("password");
const startOverBtn = document.querySelector(".start_over");
const saveFileBtn = document.querySelector(".save_btn_submit");
// text
const textForm = document.querySelector(".text_form");
const textFormInput = document.querySelector(".text_form_input");
const textPasswordInput = document.getElementById("text_password_input");
const textCancelBtn = document.querySelector(".text_btn_cancel");
const copyBtn = document.querySelector(".copy_btn");
const textOutputData = document.querySelector(".output_text");
const textEncryptBtn = document.getElementById("encrypt_btn");
const textDecryptBtn = document.getElementById("decrypt_btn");

document.querySelectorAll(".drop_zone_input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop_zone");
  dropZoneElement.addEventListener("click", (e) => {
    inputElement.value = "";
    inputElement.click();
  });
  inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
      filepath = inputElement.files[0].path;
      updateThumbnail(dropZoneElement, inputElement.files[0]);
    }
  });
  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop_zone_over");
  });
  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove("drop_zone_over");
    });
  });
  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      filepath = e.dataTransfer.files[0].path;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }
    dropZoneElement.classList.remove("drop_zone_over");
  });
});

function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop_zone_thumb");
  cThumbTitle = file.name;
  const fileExtArr = file.name.split(".");
  const fileExt = fileExtArr[fileExtArr.length - 1];
  filename = file.name.split(`.${fileExt}`)[0];
  filename = filename.split(`-(encrypted)`)[0];
  filename = filename.split(`-(decrypted)`)[0];

  // Changing styles of other after dropping file
  const dropZonePrompt = dropZoneElement.querySelector(".drop_zone_prompt");
  dropZonePrompt.textContent = file.name;
  dropZonePrompt.classList.add("drop_zone_prompt_after");
  document.querySelector(".divider").style.display = "none";
  document.querySelector(".text_form").style.display = "none";
  fileSubmitBtn.textContent = "Encrypt";

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop_zone_thumb");
    dropZoneElement.appendChild(thumbnailElement);

    // changing drop zone style
    dropZoneElement.classList.add("drop_zone_after");

    // showing file form
    document.querySelector(".file_form").style.display = "flex";
  }

  if (fileExt === "crypticia") {
    fileSubmitBtn.textContent = "Decrypt";
  }

  // updating thumbnail icon
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
      thumbnailElement.style.height = `100%`;
      thumbnailElement.style.width = `100%`;
      cThumbImgUrl = reader.result;
    };
  } else {
    // thumbnail for image
    if (fileExtensions.hasOwnProperty(fileExt)) {
      thumbnailElement.style.backgroundImage = `url('../images/${fileExtensions[fileExt]}.png')`;
      cThumbImgUrl = `../images/${fileExtensions[fileExt]}.png`;
    } else {
      thumbnailElement.style.backgroundImage = `url('../images/${fileExtensions.default}.png')`;
      cThumbImgUrl = `../images/${fileExtensions.default}.png`;
    }
    isThumbImg = false;
  }
}

fileCancelBtn.addEventListener("click", () => {
  password.value = "";
  processing = false;
  fileForm.style.display = "none";
  document.querySelector(".drop_zone_thumb").remove();
  dropZonePrompt.textContent = "Drop file here or click to encrypt/decrypt";
  dropZonePrompt.classList.remove("drop_zone_prompt_after");
  dropZone.classList.remove("drop_zone_after");
  document.querySelector(".divider").style.display = "block";
  textForm.style.display = "block";
  dropZoneInput.value = null;
  fileSubmitBtn.textContent = "Encrypt";
});

fileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (password.value === "" || password.value === null) {
    alert("error", "Please enter a password");
    return;
  }
  if (password.value.length > 16) {
    alert("error", "Password length can not be more than 16 characters");
    return;
  }

  processing = true;

  // encrypting gif

  dropZonePrompt.textContent = "";
  const thumbnailElement = document.querySelector(".drop_zone_thumb");
  thumbnailElement.style.backgroundImage = `url('../images/encrypting.gif')`;
  thumbnailElement.style.height = `100%`;
  thumbnailElement.style.width = `100%`;
  if (fileSubmitBtn.textContent === "Encrypt") {
    dropZonePrompt.textContent = "Encrypting";
  } else {
    dropZonePrompt.textContent = "Decrypting";
  }

  setTimeout(async () => {
    try {
      // encrypting
      if (fileSubmitBtn.textContent === "Encrypt") {
        const enData = await fileEncryption.encryptTextFile(
          filepath,
          password.value
        );
        if (enData && processing) {
          outputData = enData;

          document.querySelector(".file_download").style.display = "block";
          document.querySelector(".file_form").style.display = "none";
          thumbnailElement.style.backgroundImage = `url('../images/crypticia.png'`;
          thumbnailElement.style.height = `100px`;
          thumbnailElement.style.width = `100px`;
          dropZonePrompt.textContent = `${filename}-(encrypted).crypticia`;
          alert("success", "File encryption was successful.!");
        }
      }

      // decrypting
      if (fileSubmitBtn.textContent === "Decrypt") {
        const deData = await fileEncryption.decryptTextFile(
          filepath,
          password.value
        );

        if (deData && processing) {
          const oldExtArr = deData.split("(/:::::/)");
          const oldExt = oldExtArr[oldExtArr.length - 1];
          outputData = oldExtArr[0];
          outputFileType = oldExt;

          document.querySelector(".file_download").style.display = "block";
          document.querySelector(".file_form").style.display = "none";
          dropZonePrompt.textContent = `${filename}-(decrypted).crypticia`;
          alert("success", "File decryption was successful!");

          // updating thumbnail icon
          if (
            oldExt === "png" ||
            oldExt === "jpg" ||
            oldExt === "gif" ||
            oldExt === "jpeg"
          ) {
            const buf = await fileSaving.makingBuffer(deData);
            const blob = new Blob([buf], { type: "utf-8" });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => {
              thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
              thumbnailElement.style.height = `100%`;
              thumbnailElement.style.width = `100%`;
            };
          } else {
            // thumbnail for image
            if (fileExtensions.hasOwnProperty(oldExt)) {
              thumbnailElement.style.backgroundImage = `url('../images/${fileExtensions[oldExt]}.png')`;
            } else {
              thumbnailElement.style.backgroundImage = `url('../images/${fileExtensions.default}.png')`;
            }

            thumbnailElement.style.height = `100px`;
            thumbnailElement.style.width = `100px`;
          }
        }
      }
    } catch (error) {
      // error handeling
      console.log(error.message);

      if (fileSubmitBtn.textContent === "Encrypt") {
        alert("error", "Uh-oh! Something went wrong during encryption");
      }

      if (fileSubmitBtn.textContent === "Decrypt") {
        if (
          error.message ===
          `error:1e000065:Cipher functions:OPENSSL_internal:BAD_DECRYPT`
        ) {
          alert("error", "Wrong Password");
        } else {
          alert("error", "Uh-oh! Something went wrong during decryption");
        }
      }

      if (
        error.message !==
        `error:1e000065:Cipher functions:OPENSSL_internal:BAD_DECRYPT`
      ) {
        password.value = "";
        fileForm.style.display = "none";
        document.querySelector(".file_download").style.display = "none";
        document.querySelector(".drop_zone_thumb").remove();
        dropZonePrompt.textContent =
          "Drop file here or click to encrypt/decrypt";
        dropZonePrompt.classList.remove("drop_zone_prompt_after");
        dropZone.classList.remove("drop_zone_after");
        document.querySelector(".divider").style.display = "block";
        textForm.style.display = "block";
        dropZoneInput.value = null;
      } else {
        const thumbnailElement = document.querySelector(".drop_zone_thumb");
        thumbnailElement.style.backgroundImage = `url(${cThumbImgUrl})`;
        thumbnailElement.style.height = isThumbImg ? "100%" : "100px";
        thumbnailElement.style.width = isThumbImg ? "100%" : "100px";
        dropZonePrompt.textContent = cThumbTitle;
      }
    }
  }, 1500);
});

startOverBtn.addEventListener("click", () => {
  password.value = "";
  processing = false;
  fileForm.style.display = "none";
  document.querySelector(".drop_zone_thumb").remove();
  dropZonePrompt.textContent = "Drop file here or click to encrypt/decrypt";
  dropZonePrompt.classList.remove("drop_zone_prompt_after");
  dropZone.classList.remove("drop_zone_after");
  document.querySelector(".divider").style.display = "block";
  textForm.style.display = "block";
  document.querySelector(".file_download").style.display = "none";
  fileSubmitBtn.textContent = "Encrypt";
});

saveFileBtn.addEventListener("click", () => {
  if (fileSubmitBtn.textContent === "Encrypt") {
    fileSaving.savingFile(
      outputData,
      "utf-8",
      "crypticia",
      `${filename}-(encrypted)`
    );
  }
  if (fileSubmitBtn.textContent === "Decrypt") {
    const buf = fileSaving.makingBuffer(outputData);
    fileSaving.savingFile(
      buf,
      "utf-8",
      outputFileType,
      `${filename}-(decrypted)`
    );
  }
});

textFormInput.addEventListener("focus", () => {
  if (!textFormInput.classList.contains("text_form_input_after")) {
    document.querySelector(".divider").style.display = "none";
    textPasswordInput.style.display = "block";
    dropZone.style.display = "none";
    document.querySelector(".text_btn_container").style.display = "flex";
    textFormInput.classList.add("text_form_input_after");
  }
});

textCancelBtn.addEventListener("click", () => {
  document.querySelector(".divider").style.display = "block";
  dropZone.style.display = "flex";
  document.querySelector(".text_btn_container").style.display = "none";
  textPasswordInput.style.display = "none";
  document.querySelector(".output").style.display = "none";
  textFormInput.classList.remove("text_form_input_after");
  textFormInput.value = "";
  textPasswordInput.value = "";
});

textEncryptBtn.addEventListener("click", async () => {
  if (textFormInput.value === "") {
    alert("error", "Please enter text to encrypt/decrypt");
    return;
  }
  if (textPasswordInput.value === "" || textPasswordInput.value === null) {
    alert("error", "Please enter a password");
    return;
  }
  if (textPasswordInput.value.length > 16) {
    alert("error", "Password length can not be more than 16 characters");
    return;
  }

  try {
    const enData = await textEncryption.encryptText(
      textFormInput.value,
      textPasswordInput.value
    );
    document.querySelector(".output").style.display = "block";
    textOutputData.textContent = enData;
  } catch (error) {
    console.log(error);
    alert("error", "Something went wrong during encryption");
  }
});

textDecryptBtn.addEventListener("click", async () => {
  if (textFormInput.value === "") {
    alert("error", "Please enter text to encrypt/decrypt");
    return;
  }
  if (textPasswordInput.value === "" || textPasswordInput.value === null) {
    alert("error", "Please enter a password");
    return;
  }
  if (textPasswordInput.value.length > 16) {
    alert("error", "Password length can not be more than 16 characters");
    return;
  }

  try {
    const enData = await textEncryption.decryptText(
      textFormInput.value,
      textPasswordInput.value
    );
    document.querySelector(".output").style.display = "block";
    textOutputData.textContent = enData;
  } catch (error) {
    console.log(error);
    alert("error", "Something went wrong during decryption");
  }
});

copyBtn.addEventListener("click", () => {
  if (textOutputData.textContent !== "") {
    navigator.clipboard.writeText(textOutputData.textContent);
    document.querySelector(".copy_btn_text").textContent = "copied";
    document.querySelector(".copy_btn_svg").classList.add("copy_btn_svg_green");
    copyBtn.classList.add("copy_btn_green");
    setTimeout(() => {
      document.querySelector(".copy_btn_text").textContent = "copy";
      copyBtn.classList.remove("copy_btn_green");
      document
        .querySelector(".copy_btn_svg")
        .classList.remove("copy_btn_svg_green");
    }, 2000);
  }
});

// helper funcs

const alert = (type, msg) => {
  Toastify.toast({
    text: msg,
    duration: 3000,
    close: false,
    style: {
      background: type === "success" ? "#4CAF50" : "#ff5252",
      color: "white",
      textAlign: "center",
      fontSize: "14px",
    },
  });
};
