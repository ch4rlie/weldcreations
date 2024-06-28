document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navLinksLeft = document.querySelector(".nav-links.left");
  const navLinksRight = document.querySelector(".nav-links.right");

  hamburger.addEventListener("click", () => {
    navLinksLeft.classList.toggle("active");
    navLinksRight.classList.toggle("active");
    hamburger.classList.toggle("active");
  });

  const video = document.getElementById("heroVideo");

  // Try to play the video once the document is fully loaded
  video.play().catch((error) => {
    console.error("Error attempting to play the video:", error);
  });

  var splide = new Splide(".splide", {
    type: "loop",
    height: "300px",
    autoWidth: true,
  });

  splide.mount();

  const modal = document.getElementById("myModal");
  const modalImg = document.getElementById("modalImage");
  const closeModal = document.getElementsByClassName("close")[0];
  const images = document.querySelectorAll(".splide__slide img");
  let currentIndex = 0;

  function showImage(index) {
    modal.style.display = "block";
    modalImg.src = images[index].getAttribute("data-full");
    document.body.classList.add("modal-open"); // Prevent page scroll
    currentIndex = index;
  }

  images.forEach((img, index) => {
    img.addEventListener("click", function () {
      showImage(index);
    });
  });

  closeModal.onclick = function () {
    modal.style.display = "none";
    document.body.classList.remove("modal-open"); // Restore page scroll
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      document.body.classList.remove("modal-open"); // Restore page scroll
    }
  };

  // Navigation arrows
  const arrowLeft = document.createElement("span");
  arrowLeft.classList.add("arrow", "arrow-left");
  arrowLeft.innerHTML = "&#10094;"; // Left arrow HTML entity
  modal.appendChild(arrowLeft);

  const arrowRight = document.createElement("span");
  arrowRight.classList.add("arrow", "arrow-right");
  arrowRight.innerHTML = "&#10095;"; // Right arrow HTML entity
  modal.appendChild(arrowRight);

  arrowLeft.onclick = function () {
    if (currentIndex > 0) {
      showImage(currentIndex - 1);
    } else {
      showImage(images.length - 1); // Loop to the last image
    }
  };

  arrowRight.onclick = function () {
    if (currentIndex < images.length - 1) {
      showImage(currentIndex + 1);
    } else {
      showImage(0); // Loop to the first image
    }
  };
});

(function () {
  "use strict";
  /*
   * Form Validation
   */

  // Fetch all the forms we want to apply custom validation styles to
  const forms = document.querySelectorAll(".needs-validation");
  const result = document.getElementById("result");
  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();

          form.querySelectorAll(":invalid")[0].focus();
        } else {
          /*
           * Form Submission using fetch()
           */

          const formData = new FormData(form);
          event.preventDefault();
          event.stopPropagation();
          const object = {};
          formData.forEach((value, key) => {
            object[key] = value;
          });
          const json = JSON.stringify(object);
          result.innerHTML = "Please wait...";

          fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: json,
          })
            .then(async (response) => {
              let json = await response.json();
              if (response.status == 200) {
                result.innerHTML = json.message;
                result.classList.remove("text-gray-500");
                result.classList.add("text-green-500");
              } else {
                console.log(response);
                result.innerHTML = json.message;
                result.classList.remove("text-gray-500");
                result.classList.add("text-red-500");
              }
            })
            .catch((error) => {
              console.log(error);
              result.innerHTML = "Something went wrong!";
            })
            .then(function () {
              form.reset();
              form.classList.remove("was-validated");
              setTimeout(() => {
                result.style.display = "none";
              }, 5000);
            });
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();
