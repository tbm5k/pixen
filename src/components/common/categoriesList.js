/**
    * @class CategoriesList
    * @description list of categories component
    * */
class CategoriesList {
  /**
 * Creates an instance of CategoriesList.
 *
 * @constructor
 * @param {*} categories
 * @param {*} selectedIndex
 * @param {*} selectCategoryHandler
 * @param {*} onMouseEnterHandler
 */
constructor(
    categories,
    selectedIndex,
    selectCategoryHandler,
    onMouseEnterHandler
  ) {
    this.categories = categories;
    this.selectedIndex = selectedIndex;
    this.selectCategoryHandler = selectCategoryHandler;
    this.onMouseEnterHandler = onMouseEnterHandler;

    window.selectedCategoryId = this.categories[0].entity_id;
  }

  /**
 * ${1:Description placeholder}
 */
render () {
    const categories_sequence = this.categories.find(
      (item) => item.children_category_ids.length
    );

    const categories_list = [];
    if (categories_sequence) {
      categories_sequence.children_category_ids.forEach((item) => {
        categories_list.push(appData.categories[item]);
      });
    }

    this.categories = categories_list;

    let storyColor = "#fff";

    const firstCategory = Object.values(appData.categories)[0];

    if (firstCategory) {
      if (firstCategory.graphic && firstCategory.graphic.text_color) {
        storyColor = firstCategory.graphic.text_color;
      } else if (firstCategory.text_color) {
        storyColor = firstCategory.text_color;
      } else {
        storyColor = appData.graphic.mainColor;
      }
    }

    const categories_length = this.categories.length;
    const { active_color, bg_color, selected_color, text_color } =
      this.categories[0].graphic;
    const categories_list_parent = `
        <ul class="categories-list__main ${ this.categories.length < 5 ? "center" : ""
      }" id="categories_list_parent" style="width: ${ categories_length * 32.4
      }rem;">
            ${ this.categories
        .map(
          (category, index) => `
            <li class="categories-list__item categories-ctrl ${ index === this.selectedIndex ? "selected" : ""
            }"
              data-cat-id="${ category.entity_id }"
            >
            <div class="categories-list-img__parent">
            <img src="${ category.image }" alt="${ category.name
            }" class="categories-list__image" style="width: 20rem; height: 20rem" />
            </div>
            
                <p class="categories-list__name" style="color:${ storyColor }">${ category.name
            }</p>
            </li>
            `
        )
        .join("") }
        </ul>
        `;

    const home_header_wrapper = document.getElementById("home_header_wrapper"+"_home");
    home_header_wrapper.innerHTML = categories_list_parent;
    // home_header_wrapper.appendChild(categories_list_parent);

    this.setHandlers();
  }

  /**
 * ${1:Description placeholder}
 */
setHandlers () {
    const categories_list_items = document.querySelectorAll(
      ".categories-list__item"
    );
    // categories_list_items.forEach((item, index) => {
    //   item.addEventListener("click", () => {
    //     this.selectCategoryHandler(index);
    //   });
    // });

    for (let i = 0; i < categories_list_items.length; i++) {
      categories_list_items[i].addEventListener("click", () => {
        this.selectCategoryHandler(i);
        window.selectedCategoryId = this.categories[i].entity_id;
      });

      categories_list_items[i].addEventListener("mouseenter", () => {
        if (this.onMouseEnterHandler) this.onMouseEnterHandler(i);
      });
    }
  }
}

export default CategoriesList;
