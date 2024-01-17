import {
  preloadImages,
  preloadFonts,
  fetchData,
  contentfulData,
} from "./utils";
import { Row } from "./row";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { INLINES, BLOCKS } from "@contentful/rich-text-types";

// import { Tooltip } from "./tooltip";
import { LinesController } from "./linesController";

gsap.registerPlugin(Flip);
let rowsArr = [];
let currentRow = -1;

const imgLarge = 10;
const imgGapLarge = 1;
const imgSmall = 5;
const imgGapSmall = 1;

// close ctrl
const closeCtrl = document.querySelector(".preview > .preview__close");
const backCtrl = document.querySelector(".detailBack > button");
const updateRows = () => {
  // preview Items
  const previewItems = [
    ...document.querySelectorAll(".preview > .preview__item"),
  ];
  // initial rows
  const rows = [...document.querySelectorAll(".row")];
  // cover element
  const cover = document.querySelector(".cover");

  const body = document.body;

  // Row instance array

  rows.forEach((row, position) => {
    rowsArr.push(new Row(row, previewItems[position]));
  });

  let isOpen = false;
  let isAnimating = false;

  let mouseenterTimeline;

  for (const row of rowsArr) {
    row.DOM.el.addEventListener("mouseenter", () => {
      if (isOpen) return;

      gsap.killTweensOf([row.DOM.images, row.DOM.title]);

      mouseenterTimeline = gsap
        .timeline()
        .addLabel("start", 0)
        .to(
          row.DOM.images,
          {
            duration: 0.4,
            ease: "power3",
            startAt: {
              scale: 0.8,
              xPercent: 20,
            },
            scale: 1, //mosley
            xPercent: 0,
            opacity: 1,
            stagger: -0.035,
          },
          "start"
        )
        .set(row.DOM.title, { transformOrigin: "0% 50%" }, "start")
        .to(
          row.DOM.title,
          {
            duration: 0.1,
            ease: "power1.in",
            yPercent: -100,
            onComplete: () =>
              row.DOM.titleWrap.classList.add("cell__title--switch"),
          },
          "start"
        )
        .to(
          row.DOM.title,
          {
            duration: 0.5,
            ease: "expo",
            startAt: {
              yPercent: 100,
              // rotation: 15,
            },
            yPercent: 0,
            rotation: 0,
          },
          "start+=0.1"
        );
    });

    row.DOM.el.addEventListener("mouseleave", () => {
      if (isOpen) return;

      gsap.killTweensOf([row.DOM.images, row.DOM.title]);

      gsap
        .timeline()
        .addLabel("start")
        .to(
          row.DOM.images,
          {
            duration: 0.4,
            ease: "power4",
            opacity: 0,
            scale: 0.8,
          },
          "start"
        )
        .to(
          row.DOM.title,
          {
            duration: 0.1,
            ease: "power1.in",
            yPercent: -100,
            onComplete: () =>
              row.DOM.titleWrap.classList.remove("cell__title--switch"),
          },
          "start"
        )
        .to(
          row.DOM.title,
          {
            duration: 0.5,
            ease: "expo",
            startAt: {
              yPercent: 100,
              // rotation: 15,
            },
            yPercent: 0,
            rotation: 0,
          },
          "start+=0.1"
        );
    });

    // Open a row and reveal the grid
    row.DOM.el.addEventListener("click", (e) => {
      let _1vw = Math.round(window.innerWidth / 100);
      if (isAnimating) return;
      isAnimating = true;
      sectionSelected = true;
      isOpen = true;
      currentRow = rowsArr.indexOf(row);
      gsap.killTweensOf([cover, rowsArr.map((row) => row.DOM.title)]);

      let gridRows =
        Math.ceil(rowsArr[currentRow].previewItem.DOM.images.length / 4) + 1;
      let availableSpace = window.innerHeight - 200;
      let ratio = Math.min(1, availableSpace / gridRows / (10 * _1vw)).toFixed(
        2
      );
      // let fits = (availableSpace / gridRows) > (10 * _1vw);

      let myImgLarge = imgLarge * ratio;
      let myImgGapLarge = imgGapLarge * ratio;
      let myImgSmall = imgSmall * ratio;
      let myImgGapSmall = imgGapSmall * ratio;
      row.previewItem.DOM.grid.style.setProperty(
        "--img-size",
        myImgLarge + "vw"
      );
      gsap.to(
        row.DOM.images,
        {
          duration: 0.9,
          "--img-size-large": myImgLarge + "vw", //mosley
          "--image-gap-large": myImgGapLarge + "vw", //mosley
          "--img-size": myImgSmall + "vw", //mosley
          "--img-gap": myImgGapSmall + "vw", //mosley
        },
        0.04 * row.DOM.images.length
      );
      gsap
        .timeline({
          onStart: () => {
            body.classList.add("oh");
            row.DOM.el.classList.add("row--current");
            row.previewItem.DOM.el.classList.add("preview__item--current");

            gsap.set(row.previewItem.DOM.images, { opacity: 0 });

            // set cover to be on top of the row and then animate it to cover the whole page
            gsap.set(cover, {
              height: row.DOM.el.offsetHeight - 1, // minus border width
              top: row.DOM.el.getBoundingClientRect()["top"],
              opacity: 1,
            });

            gsap.set(row.previewItem.DOM.title, {
              yPercent: -100,
              // rotation: 15,
              transformOrigin: "100% 50%",
            });

            closeCtrl.classList.add("preview__close--show");
          },
          onComplete: () => (isAnimating = false),
        })
        .addLabel("start", 0)
        .to(
          cover,
          {
            duration: 0.9,
            ease: "power4.inOut",
            height: window.innerHeight,
            top: 0,
          },
          "start"
        )
        .to(
          closeCtrl,
          {
            x: 0,
            opacity: 1,
          },
          "start"
        )
        // animate all the titles out
        .to(
          rowsArr.map((row) => row.DOM.title),
          {
            duration: 0.5,
            ease: "power4.inOut",
            yPercent: (_, target) => {
              return target.getBoundingClientRect()["top"] >
                row.DOM.el.getBoundingClientRect()["top"]
                ? 100
                : -100;
            },
            rotation: 0,
          },
          "start"
        )
        .to(
          row.previewItem.DOM.images,
          {
            "--img-size-large": myImgLarge + "vw", //mosley
            "--image-gap-large": myImgGapLarge + "vw", //mosley
            "--img-size": myImgSmall + "vw", //mosley
            "--img-gap": myImgGapSmall + "vw", //mosley
          },
          0.04 * row.DOM.images.length
        )
        .to(
          row.previewItem.DOM.title,
          {
            duration: 1,
            ease: "power4.inOut",
            yPercent: 0,
            rotation: 0,
            onComplete: () =>
              row.DOM.titleWrap.classList.remove("cell__title--switch"),
          },
          "start"
        )
        .add(() => {
          mouseenterTimeline.progress(1, false);
          const flipstate = Flip.getState(row.DOM.images, { simple: true });
          row.previewItem.DOM.grid.prepend(...row.DOM.images);
          Flip.from(flipstate, {
            duration: 0.9,
            ease: "power4.inOut",
            //absoluteOnLeave: true,
            stagger: 0.04,
          })
            // other images in the grid
            .to(
              row.previewItem.DOM.images,
              {
                duration: 0.9,
                ease: "power4.inOut",
                startAt: {
                  scale: 0,
                  yPercent: () => gsap.utils.random(0, 200),
                },
                scale: 1, //mosley
                opacity: 1,
                yPercent: 0,
                stagger: 0.04,
              },
              0.04 * row.DOM.images.length
            )
            .to(
              row.DOM.images,
              {
                "--img-size-large": myImgLarge + "vw", //mosley
                "--image-gap-large": myImgGapLarge + "vw", //mosley
                "--img-size": myImgSmall + "vw", //mosley
                "--img-gap": myImgGapSmall + "vw", //mosley
              },
              "start"
            );
        }, "start");

      document.querySelectorAll("a[data-tooltip]").forEach((link) => {
        link.addEventListener("mouseenter", linkEnter);
        link.addEventListener("mouseleave", linkLeave);
        link.addEventListener("click", linkClick);
      });
    });
  }
  backCtrl.addEventListener("click", () => {
    let winsize = { width: window.innerWidth, height: window.innerHeight };
    lineController.DOM.detailBoxPreview[0].style.pointerEvents = "none";
    backtl = gsap
      .timeline({
        defaults: {
          duration: 0.5,
          ease: "power4.inOut",
        },
      })
      .addLabel("start", 0)
      .to(
        lineController.DOM.detailIcon[0],
        {
          opacity: 0,
        },
        "start"
      )
      .to(
        lineController.DOM.detailBack[0],
        {
          top: -100,
          opacity: 0,
        },
        "start"
      )
      .to(
        lineController.DOM.lines,
        {
          x: 0,
          y: 0,
          opacity: 0,
        },
        "start"
      )
      .to(
        lineController.DOM.titleBoxPreview[0],
        {
          width: winsize.width,
          height: winsize.height,
        },
        "start"
      )
      .to(
        lineController.DOM.detailBoxPreview[0],
        {
          width: winsize.width,
          height: winsize.height,
        },
        "start"
      )
      .to(
        closeCtrl,
        {
          x: 0,
          opacity: 1,
        },
        "start"
      );

    for (const row of rowsArr) {
      gsap
        .timeline({
          defaults: {
            duration: 0.5,
            ease: "power4.inOut",
          },
        })
        .addLabel("start", 0)
        // .set(row.DOM.title, { transformOrigin: "50% 50%" }, "start")
        .to(
          row.previewItem.DOM.images,
          {
            scale: 1,
          },
          "start"
        )
        .to(
          row.DOM.images,
          {
            scale: 1,
          },
          "start"
        )
        .to(
          row.previewItem.DOM.title,
          {
            duration: 0.6,
            yPercent: 0,
          },
          "start"
        );

      document.querySelectorAll("a[data-tooltip]").forEach((link) => {
        link.addEventListener("mouseenter", linkEnter);
        link.addEventListener("mouseleave", linkLeave);
        link.addEventListener("click", linkClick);
      });
    }
  });
  // Close the grid and show back the rows
  closeCtrl.addEventListener("click", () => {
    if (isAnimating) return;
    sectionSelected = false;
    isAnimating = true;

    isOpen = false;

    const row = rowsArr[currentRow];

    gsap
      .timeline({
        defaults: { duration: 0.5, ease: "power4.inOut" },
        onStart: () => body.classList.remove("oh"),
        onComplete: () => {
          row.DOM.el.classList.remove("row--current");
          row.previewItem.DOM.el.classList.remove("preview__item--current");
          isAnimating = false;
        },
      })
      .addLabel("start", 0)
      .to(
        [row.DOM.images, row.previewItem.DOM.images],
        {
          scale: 0,
          opacity: 0,
          stagger: 0.04,
          onComplete: () => row.DOM.imagesWrap.prepend(...row.DOM.images),
          "--img-size-large": "10vw", //mosley
          "--image-gap-large": "1vw", //mosley
          "--img-size": "5vw", //mosley
          "--img-gap": "1vw", //mosley
        },
        0
      )
      .to(
        row.previewItem.DOM.title,
        {
          duration: 0.6,
          yPercent: 100,
        },
        "start"
      )
      .to(
        closeCtrl,
        {
          x: 200,
          opacity: 0,
        },
        "start"
      )
      // animate cover out
      .to(
        cover,
        {
          ease: "power4",
          height: 0, //,row.DOM.el.offsetHeight-1, // minus border width
          top:
            row.DOM.el.getBoundingClientRect()["top"] +
            row.DOM.el.offsetHeight / 2,
        },
        "start+=0.4"
      )
      // fade out cover
      .to(
        cover,
        {
          duration: 0.3,
          opacity: 0,
        },
        "start+=0.9"
      )
      // animate all the titles in
      .to(
        rowsArr.map((row) => row.DOM.title),
        {
          yPercent: 0,
          stagger: {
            each: 0.03,
            grid: "auto",
            from: currentRow,
          },
        },
        "start+=0.4"
      );

    document.querySelectorAll("a[data-tooltip]").forEach((link) => {
      link.removeEventListener("mouseenter", linkEnter);
      link.removeEventListener("mouseleave", linkLeave);
      link.removeEventListener("click", linkClick);
    });
  });
};
// TOOL TIP SECTION
let sectionSelected = false;
// gsap timelines
let entertl, leavetl, clicktl, zoomintl, zoomouttl, backtl, boxtl;
const lineController = new LinesController([
  ...document.querySelectorAll(".line"),
]);

gsap.set(lineController.DOM.detailBack[0], {
  top: -100,
  opacity: 0,
});
const linkClick = (e) => {
  if (!sectionSelected) return;
  //ENABLE POINTER EVENTS FOR detailbox-preview
  lineController.DOM.detailBoxPreview[0].style.pointerEvents = "all";
  let winsize = { width: window.innerWidth, height: window.innerHeight };
  lineController.DOM.linesHorizontal[1].style.top = winsize.height + "px";
  var rect = e.target.getBoundingClientRect();
  // console.log(rect);
  let detailIconMin = Math.max(10 * Math.round(window.innerHeight / 100,10 * Math.round(window.innerheight / 100))); 
  console.log("detailIconMin",detailIconMin)
  //This is the smallest we sould want it to get.
  const linePos = {
    horizontal: [0, -winsize.height + Math.max(rect.height, detailIconMin)],
    vertical: [0, -winsize.width + Math.max(rect.width, detailIconMin)],
  };
  lineController.DOM.detailIcon[0].style.backgroundImage = getComputedStyle(
    e.target
  ).getPropertyValue("background-image");

  // console.log("linePos.horizontal", linePos.horizontal)
  // console.log("linePos.verticao", linePos.vertical)

  clicktl = gsap
    .timeline({
      defaults: {
        duration: 0.5,
        ease: "power4.inOut",
      },
    })
    .addLabel("start", 0)
    .to(
      lineController.DOM.linesHorizontal[0],
      {
        y: linePos.horizontal[0],
        opacity: 1,
      },
      "start"
    )
    .to(
      lineController.DOM.linesHorizontal[1],
      {
        y: linePos.horizontal[1],
        opacity: 1,
      },
      "start"
    )
    .to(
      lineController.DOM.linesVertical[0],
      {
        x: linePos.vertical[0],
        opacity: 1,
      },
      "start"
    )
    .to(
      lineController.DOM.linesVertical[1],
      {
        x: linePos.vertical[1],
        opacity: 1,
      },
      "start"
    )
    .to(
      closeCtrl,
      {
        x: 200,
        opacity: 0,
      },
      "start"
    )
    .to(
      lineController.DOM.detailIcon[0],
      {
        width: winsize.width + linePos.vertical[1],
        height: winsize.width + linePos.vertical[1],
        opacity: 1,
      },
      "start"
    )
    .to(
      lineController.DOM.detailBack[0],
      {
        top: winsize.width + linePos.vertical[1],
        opacity: 1,
        width: winsize.width + linePos.vertical[1],
      },
      "start"
    )
    .to(
      lineController.DOM.detailBoxPreview[0],
      {
        y: winsize.height + linePos.horizontal[1],
        x:
          winsize.width / 2 > linePos.vertical[0]
            ? linePos.vertical[0] + Math.max(rect.width, detailIconMin)
            : 0,
        width:
          winsize.width / 2 > linePos.vertical[0]
            ? -1 * linePos.vertical[1]
            : linePos.vertical[0],
        height: -1 * linePos.horizontal[1],
        opacity: 0.85,
      },
      "start"
    )
    .to(
      lineController.DOM.titleBoxPreview[0],
      {
        y: linePos.horizontal[0],
        x:
          winsize.width / 2 > linePos.vertical[0]
            ? linePos.vertical[0] + Math.max(rect.width, detailIconMin)
            : 0,
        width:
          winsize.width / 2 > linePos.vertical[0]
            ? -1 * linePos.vertical[1]
            : linePos.vertical[0],
        height: winsize.height + linePos.horizontal[1] - linePos.horizontal[0],
        opacity: 0.85,
      },
      "start"
    );

  for (const row of rowsArr) {
    gsap
      .timeline({
        defaults: {
          duration: 0.5,
          ease: "power4.inOut",
        },
      })
      .addLabel("start", 0)
      .to(
        row.previewItem.DOM.images,
        {
          scale: 0,
        },
        "start"
      )
      .to(
        row.DOM.images,
        {
          scale: 0,
        },
        "start"
      )
      .to(
        row.previewItem.DOM.title,
        {
          duration: 0.6,
          yPercent: 100,
        },
        "start"
      );
  }

  document.querySelectorAll("a[data-tooltip]").forEach((link) => {
    link.removeEventListener("mouseenter", linkEnter);
    link.removeEventListener("mouseleave", linkLeave);
    link.removeEventListener("click", linkClick);
  });
};
const linkEnter = (e) => {
  let winsize = { width: window.innerWidth, height: window.innerHeight };
  let dataType = e.currentTarget.getAttribute("data-type");

  let title = e.target.getAttribute("data-title");
  let image = e.target.getAttribute("data-image");
  if (dataType == "photo") {
    lineController.DOM.detailBoxPreview[0].style.backgroundImage =
      "url(" + image + ")";
  } else {
    lineController.DOM.detailBoxPreview[0].style.backgroundImage = "";
  }
  let description =
    dataType !== "photo"
      ? decodeURIComponent(e.target.getAttribute("data-desc"))
      : "";
  lineController.DOM.titleBoxPreview[0].children[0].innerHTML = title;
  lineController.DOM.detailBoxPreview[0].children[0].innerHTML = description;

  var rect = e.target.getBoundingClientRect();
  // disable the mouse hover events after clicking on the link
  if (!sectionSelected) return;

  const linePos = {
    horizontal: [rect.top, -winsize.height + (rect.top + rect.height)],
    vertical: [rect.left, -winsize.width + (rect.left + rect.width)],
  };
  entertl = gsap
    .timeline({
      defaults: {
        duration: 0.5,
        ease: "power4.inOut",
      },
    })
    .addLabel("start", 0)
    .to(
      lineController.DOM.linesHorizontal[0],
      {
        y: linePos.horizontal[0],
        opacity: 1,
      },
      "start"
    )
    .to(
      lineController.DOM.linesHorizontal[1],
      {
        y: linePos.horizontal[1],
        opacity: 1,
      },
      "start"
    )
    .to(
      lineController.DOM.linesVertical[0],
      {
        x: linePos.vertical[0],
        opacity: 1,
      },
      "start"
    )
    .to(
      lineController.DOM.linesVertical[1],
      {
        x: linePos.vertical[1],
        opacity: 1,
      },
      "start"
    )
    .to(
      lineController.DOM.titleBoxPreview[0],
      {
        y: linePos.horizontal[0],
        x:
          winsize.width / 2 > linePos.vertical[0]
            ? linePos.vertical[0] + rect.width
            : 0,
        width:
          winsize.width / 2 > linePos.vertical[0]
            ? -1 * linePos.vertical[1]
            : linePos.vertical[0],
        height: winsize.height + linePos.horizontal[1] - linePos.horizontal[0],
        opacity: 0.85,
      },
      "start"
    );
};
const linkLeave = (e) => {
  if (!sectionSelected) return;
  let winsize = { width: window.innerWidth, height: window.innerHeight };

  leavetl = gsap
    .timeline({
      defaults: {
        duration: 0.5,
        ease: "power4.inOut",
      },
      // onStart: () => console.log("on start of leave"),
      // onComplete: () => console.log("on complete of leave"),
    })
    .addLabel("start", 0)
    .to(
      lineController.DOM.lines,
      {
        x: 0,
        y: 0,
        opacity: 0,
      },
      "start"
    )
    .to(
      lineController.DOM.titleBoxPreview[0],
      {
        width: winsize.width,
        height: winsize.height,
      },
      "start"
    );
};
// resize event
window.addEventListener("resize", () => {
  document.querySelectorAll("a[data-tooltip]").forEach((link) => {
    link.removeEventListener("mouseenter", linkEnter);
    link.removeEventListener("mouseleave", linkLeave);
    link.addEventListener("mouseenter", linkEnter);
    link.addEventListener("mouseleave", linkLeave);
  });
});

// Preload
let timerVar;
Promise.all([
  preloadImages(".cell__img-inner"),
  preloadFonts(),
  fetchData(),
]).then(() => {
  timerVar = setInterval(contentfulDataCheck, 1000);
});

function contentfulDataCheck() {
  if (contentfulData) {
    clearInterval(timerVar);
    //populate the rows with the contentful data.
    populateRows("about", "About", "about");
    populateRows("skills", "Skills", "skill");
    populateRows("jobs", "Jobs", "job");
    populateRows("work", "Projects", "project");
    populateRows("photos", "Photos", "photo");
    updateRows();
    document.body.classList.remove("loading");
  }
}

const populateRows = (rowName, contentfulName, soloName) => {
  var itemsCollection = contentfulData.filter((obj) => {
    return obj.title === contentfulName;
  })[0].itemsCollection;
  const elements = document.getElementsByClassName(rowName);

  const elem = elements[0].getElementsByClassName("cell--images")[0];
  const elemPreview = elements[1].getElementsByClassName("grid")[0];
  for (let i = 0; i < itemsCollection.length; i++) {
    let thisItem = itemsCollection[i][soloName];
    let imageUrl = thisItem.poster ? thisItem.poster.url : "/img/1.jpg";
    let title = thisItem.title
      ? thisItem.title
      : thisItem.name
      ? thisItem.name
      : thisItem.company;
    if (thisItem.title == "Miscellaneous") {
      console.log("thisItem", thisItem);
    }

    // create an asset map
    const assetMap = new Map();

    if (thisItem.description && thisItem.description.links) {
      // loop through the linked assets and add them to a map
      for (const asset of thisItem.description.links.assets.block) {
        assetMap.set(asset.sys.id, asset);
      }
    }

    const contentfulRenderOptions = {
      renderNode: {
        [INLINES.HYPERLINK]: (node, next) => {
          return `<a href="${node.data.uri}" target="_blank"'>${next(
            node.content
          )}</a>`;
        },
        [BLOCKS.EMBEDDED_ASSET]: (node, next) => {
          const asset = assetMap.get(node.data.target.sys.id);
          return `<div class='detail-item'><div class="detail-item-sub"><img
          src=${asset.url}
          height='100'
          alt=${asset.title}
        /></div><div class="detail-item-sub">${asset.description}</div></div>`;
        },
      },
    };

    const html =
      '<a data-type="' +
      soloName +
      '" data-image="' +
      imageUrl +
      '" data-desc="' +
      encodeURIComponent(
        documentToHtmlString(
          thisItem.description ? thisItem.description.json : "",
          contentfulRenderOptions
        )
      ) +
      '" data-title="' +
      title +
      '" class="tt-hover-line" data-tooltip><div class="cell__img-inner" style="background-image:url(' +
      imageUrl +
      ');"></div></a>';
    const node = document.createElement("div");
    node.classList.add("cell__img");
    node.innerHTML = html;
    if (i < 5) {
      elem.appendChild(node);
    } else {
      elemPreview.appendChild(node);
    }
  }
};
