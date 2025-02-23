/**
 * Hashes page layout
 */

import { el } from "../utils";
import "../styles/hashes.css";
import controles from "../remote/controles";
import { startApp } from "..";

/**
 * @class HashesPage
 * @typedef {HashesPage}
 */
class HashesPage {
  /**
 * Creates an instance of HashesPage.
 *
 * @constructor
 */
  constructor() {
      this.hashes = [
          { id: 1, name: "24 Flix", hash: "njsfvtweaa" },
          { id: 2, name: "Fashion TV", hash: "4fpgggl6py" },
          { id: 3, name: "Metflix TV", hash: "YmT9LgwUWq" },
          { id: 4, name: "Ikoflix TV ", hash: "z76dwa3cyy" },
          { id: 5, name: "Nollywood Capital TV", hash: "7eo2kmlvum" },
          { id: 6, name: "High Octane", hash: "8mslt993x6" },
          { id: 7, name: "BLOOM Wellness Channel", hash: "oyEEJSrfzm" },
          { id: 8, name: "Getreel Fireplace", hash: "3zozgqyao9" },
          { id: 9, name: "Level 33", hash: "aivkv1jkav" },
          { id: 10, name: "Games Tips&Tricks", hash: "ssbca6m6tx" },
          { id: 11, name: "Indie Box", hash: "aicx5oo0g7" },
          { id: 12, name: "Todazon", hash: "9sm3mdzozm" },
          { id: 13, name: "Prank TV", hash: "d8r6t4xi80" },
          { id: 14, name: "Coffe Jazz music", hash: "m1dk1729h5" },
          { id: 15, name: "Tiger Best Social Videos", hash: "23r2bkw84q" },
          { id: 16, name: "Vision for the people", hash: "9gm6f66ymk" },
          { id: 17, name: "Aquarium", hash: "8ip2rzculz" },
          { id: 18, name: "FVM", hash: "p0fy9so7re" },
          { id: 19, name: "Gags for guys", hash: "7szs75vzjy" },
          { id: 20, name: "Foody", hash: "fy4l1l7hi7" },
          { id: 21, name: "Cool School", hash: "h0yxqwmodb" },
          { id: 22, name: "Popstar TV", hash: "19jo2a7qtm" },
          { id: 23, name: "Nollywood Capital TV", hash: "s6xjws00o5" },
          { id: 24, name: "Unreal TV", hash: "vklwkp7w2s" },
          { id: 25, name: "Auto Allstars", hash: "ctxe85cvw5" },
          { id: 26, name: "Rep Dat TV", hash: "baqn4tlk8e" },
          { id: 27, name: "ScreenMagic TV", hash: "kkuysj93kf" },
          { id: 28, name: "Todazone", hash: "v8ysgroly4" },
          { id: 29, name: "Menaflix", hash: "h0th42e7cb" },
          { id: 30, name: "DOC BOX", hash: "wdjzf9ayeb" },
          { id: 31, name: "Black screen", hash: "zvmhs9hfuj" },
          { id: 32, name: "Bob The Train", hash: "j4lseacvi8" },
          { id: 33, name: "Made It Myself TV", hash: "745mzqybbr" },
          { id: 34, name: "Brazil Times", hash: "j2r5jdz7xc" },
          { id: 35, name: "DangerTV", hash: "79gqu2zw9w" },
          { id: 36, name: "Yoga Fit", hash: "wt4ufsx98l" },
          { id: 37, name: "Trend Wave", hash: "ns6c1ns8vw" },
          { id: 38, name: "8K landscape", hash: "mkssfk3sm2" },
          { id: 39, name: "OMG! TMG!", "hash": "7cz8ht2jyx" },
          { id: 40, name: "Bama-Q", "hash": "ynrt07zfmh" },
          { id: 41, name: "Short Box TV", "hash": "7hqku22o8s" },
          { id: 42, name: "Kids TV Español Latino", "hash": "8dvlj4je0h" },
          { id: 43, name: "Sports International TV", "hash": "81htk6minw" },
          { id: 44, name: "ASAP Network", "hash": "zp4412g6bh" },
          { id: 45, name: "Free Classic Movies", "hash": "fqxmyyxy86" },
          { id: 46, name: "Trend Wave", "hash": "ns6c1ns8vw" },
          { id: 47, name: "Scare TV", "hash": "2sxu7i54vb" },
          { id: 48, name: "BLOOM Wellness Channel", "hash": "93pglgvate" },
          { id: 49, name: "Channel Fight Masterclass", "hash": "f02dgbaixd" },
          { id: 50, name: "8K landscape", "hash": "mkssfk3sm2" }
      ];
  }

  render() {
    const root = document.getElementById("root");

    const hashesParent = el("div", "hashes-parent", "hashes_parent");
    const hashesWrapper = el("div", "hashes-wrapper", "hashes_wrapper");
    const renderHashes = this.renderHashesList();

    hashesWrapper.appendChild(renderHashes);
    hashesParent.appendChild(hashesWrapper);
    root.appendChild(hashesParent);

    controles.set_current("main");
    controles.main.set_current("hashes");
    controles.main.hashes.move();
    pages.page_objects.hashes = document.getElementById('hashes_parent');
  }

  /**
 * Display hashes list
 *
 * @returns {*}
 */
  renderHashesList() {
    const hashesList = el("div", "hashes-list", "hashes_list");

    for (let i = 0; i < this.hashes.length; i++) {
      const hashItem = el("div", "hashes-item hash-ctrl", "hashes_item");
      hashItem.innerText = this.hashes[i].name;
      hashItem.addEventListener("click", () => {
        startApp(this.hashes[i].hash);
      });

      hashItem.addEventListener("mouseover", () => {
        controles.main.hashes.index = this.hashes[i].id - 1;
        controles.main.hashes.move();
      });
      hashesList.appendChild(hashItem);
    }

    return hashesList;
  }
}

export default HashesPage;
