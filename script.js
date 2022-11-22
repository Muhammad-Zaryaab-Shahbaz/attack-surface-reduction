/**
 * Author: Muhammad Zaryaab Shahbaz
 * Email: zariab64@gmail.com
 * Date: 11/22/22
 */
const attacks = [
  "Bandit Yeti has identified an open SSH port on Santa’s webserver.",
  "A document file with malicious macros is opened by a user",
  "Some sensitive data related to Santa’s server is found on a filesharing website",
  "Spoofed phishing emails are sent to Santa’s employees",
  "Password brute forcing attack is attempted on Santa's",
  "Santa’s employee finds a USB in the parking lot that has malware and he plugs it in his system and gets compromised",
];
const asr = [
  {
    id: 2,
    value:
      "Sensitive data from the file-sharing site is removed to avoid Bandit Yeti taking advantage of that data",
  },
  { id: 0, value: "Unnecessary ports are closed to avoid attack attempts" },
  {
    id: 4,
    value: "Strong password policy is enabled to thwart brute force attacks",
  },
  { id: 1, value: "Macros are blocked on the Santa's network by policy" },
  {
    id: 5,
    value:
      "Applocker is deployed network-wide to block execution of unknown/non-whitelisted applications.",
  },
  { id: 3, value: "Phishing protection is enabled on Santa’s email server" },
];

const template = num => {
  return `<div class="section d-flex align-items-center text-center py-2" data-position=${num}>
  <p class="static w-50 my-1 pe-2">${attacks[num]}</p>
  <p id="asr_${asr[num].id}" class="free w-50 my-1 ms-2 px-2 rounded" draggable=true data-position=${asr[num].id}>${asr[num].value}</p>
</div>`;
};

let selectedElement;

// check if piece is in correct position
const checkPiece = (piece, parent) => {
  if ($(piece).data("position") === $(parent).data("position")) {
    $(parent).addClass("correct");
  } else if (parent.hasClass("correct")) {
    $(parent).removeClass("correct");
  }
};

// check if all pieces are in correct place
const checkWin = () => {
  const correct = $(".correct").length;
  const total = $(".free").length;

  const percent =
    Math.round(((correct / total) * 100 + Number.EPSILON) * 100) / 100;
  const progress = document.getElementById("puzzle-progress");
  const color = percent >= 50 ? "#A3EA2A" : "#ECBB0A";
  progress.setAttribute("style", `color: ${color}`);
  $(progress).html(`${percent}%`);

  $("#question-number").html(correct);

  if (correct !== total) return;

  const flag = document.getElementById("flag");
  flag.innerText = atob(flag.innerText);

  $("#content").addClass("d-none");
  $("#reward").removeClass("d-none");
};

// create matching column
const init = () => {
  const pieces = attacks.length;

  const wrapper = document.getElementById("wrapper");

  // create empty game variable
  let content = "";

  // create each piece as an element
  for (let i = 0; i < pieces; i++) {
    content += template(i);
  }

  // insert templates into DOM
  $(wrapper).append(content);

  const gridTiles = $(".free");

  gridTiles.each(i => {
    // enable dropping
    gridTiles[i].addEventListener("dragover", event => {
      event.preventDefault();
    });

    // user starts dragging event
    gridTiles[i].addEventListener("dragstart", event => {
      selectedElement = event.target.id;
    });

    // user starts drop event
    gridTiles[i].addEventListener("drop", event => {
      const selected = $("#" + selectedElement);
      const target = $(event.target).hasClass("free")
        ? $(event.target).closest(".section")
        : "#" + event.target.id;

      // add piece to grid tile if tile empty or swap
      if ($(target).html().length) {
        const pieceToSwap = $(target).find(".free");
        const selectedParent = selected.parent();

        pieceToSwap.appendTo(selectedParent);
        selected.appendTo(target);

        checkPiece(selected, target);
        checkPiece(pieceToSwap, selectedParent);
      }

      setTimeout(() => checkWin(), 100);
    });
  });
};

init();
