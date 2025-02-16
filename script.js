/**
 * Fetch recipes from API based on selected category.
    Filter by Category
    www.themealdb.com/api/json/v1/1/filter.php?c=CategoryName
 */

let data = null; // Stores fetched recipe data

const getCategory = async (category) => {
  try {
    const recipeData = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );

    if (!recipeData.ok) {
      throw new Error("Could not get recipes");
    }

    data = await recipeData.json();
    displayRecipeCards(); // Display fetched recipes
  } catch (error) {
    console.log("Error: ", error);
  }
};

/**
 * Adds event listeners to category buttons to fetch recipes on click.
 */
document.querySelectorAll(".categories button").forEach((button) => {
  button.addEventListener("click", function () {
    // Remove "active-category" from all buttons
    document.querySelectorAll(".categories button").forEach((btn) => {
      btn.classList.remove("active-category");
      btn.classList.add("default-category");
    });

    // Add "active-category" to the clicked button
    this.classList.remove("default-category");
    this.classList.add("active-category");

    // Fetch recipes based on clicked category (button ID)
    getCategory(this.id);
  });
});

// Fetch default category on page load (Beef)
getCategory("beef");

/**
 * Displays fetched recipes as cards in the UI.
 */
function displayRecipeCards() {
  const container = document.getElementById("data");
  container.innerHTML = ""; // Clear previous data

  if (!data.meals) {
    container.innerHTML = "<p>No recipes found</p>";
    return;
  }

  data.meals.slice(0, 12).forEach((meal) => {
    const mealCard = document.createElement("div");
    mealCard.classList.add("recipe-card");

    mealCard.innerHTML = `
      <div class="flex flex-col rounded-md bg-primary h-55 sm:h-65 md:h-65 lg:h-68 cursor-pointer shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-transform duration-300 ease-in-out">
        <div class="h-35 sm:h-45">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-image rounded-t-md object-cover w-full h-full">
        </div>
        <div class="p-2 mt-3"> 
          <h3 class="font-semibold text-sm sm:text-md md:text-sm lg:text-lg line-clamp-2">${meal.strMeal}</h3>
        </div>
      </div>
    `;

    // Add click event listener to each card
    mealCard.addEventListener("click", () => {
      showRecipe(meal.strMeal); // Pass the recipe name
    });

    container.appendChild(mealCard);
  });
}

/**
 * Fetch and display detailed information about a selected recipe.
   Search meal by name
   www.themealdb.com/api/json/v1/1/search.php?s=RecipeName
 */
const showRecipe = async (recipeName) => {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${recipeName}`
    );

    if (!response.ok) {
      throw new Error("Could not get recipes");
    }

    const data = await response.json();

    if (data.meals) {
      const recipe = data.meals[0];
      displaySingleRecipe(recipe); // Pass the recipe to the displaySingleRecipe function
      window.scrollTo({ top: 390, behavior: "smooth" }); //Scrolls to top
    } else {
      console.log("Recipe not found");
    }
  } catch (error) {
    console.log("Error fetching recipe:", error);
  }
};

/**
 * Searches for recipes based on user input.
 * Search meal by name
   www.themealdb.com/api/json/v1/1/search.php?s=RecipeName
 */
const searchRecipe = async () => {
  try {
    const searchQuery = document.getElementById("searchInput").value.trim();

    if (!searchQuery) {
      alert("Please enter a search term.");
      return;
    }

    const recipeData = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`
    );

    if (!recipeData.ok) {
      throw new Error("Could not get recipes");
    }

    const data = await recipeData.json();

    const singleRecipeContainer = document.getElementById("singleRecipe");
    singleRecipeContainer.innerHTML = ""; // Clear previous search results

    if (!data.meals) {
      singleRecipeContainer.innerHTML =
        "<p class='text-center text-red-500'>No recipes found.</p>";
      return;
    }

    displaySingleRecipe(data.meals[0]); // Show the searched recipe
  } catch (error) {
    console.log("Error: ", error);
  }
};

/**
 * Displays detailed information about a single recipe.
 * Recipe object containing details.
 */
function displaySingleRecipe(recipeData) {
  const container = document.getElementById("singleRecipe");
  container.innerHTML = ""; // Clear previous data

  const recipe = recipeData; // Store the recipe object for easier reference

  // Generate ingredient list dynamically
  let ingredientsList = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`]; // Get ingredient name
    const measure = recipe[`strMeasure${i}`]; // Get ingredient quantity/measurement

    // Check if the ingredient exists and is not empty before adding to the list
    if (ingredient && ingredient.trim() !== "") {
      ingredientsList += `<li>${measure} ${ingredient}</li>`;
    }
  }

  // Format the cooking instructions by splitting them into separate paragraphs for readability
  const instructions = recipe.strInstructions
    .split(/\r\n|\n/) // Split at line breaks
    .map((line) => `<p class="mb-4">${line}</p>`) // Wrap each in <p> with margin-bottom
    .join(""); // Join back as a string

  // Extract YouTube video ID from URL
  const youtubeUrl = recipe.strYoutube;
  let youtubeEmbed = "";

  if (youtubeUrl && youtubeUrl.trim() !== "") {
    const videoId = youtubeUrl.split("v=")[1]?.split("&")[0]; // Extract video ID from URL
    youtubeEmbed = `
      <div class="mt-6">
        <h2 class="font-bold text-xl md:text-3xl mb-3">Watch Tutorial</h2>
        <div>
          <iframe 
            class="w-full h-56 sm:h-80 lg:h-85 md:w-140 rounded-md border-0" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>
      </div>  
    `;
  }

  // Generate the full recipe details HTML structure
  container.innerHTML = `
    <h1 class="font-semibold text-4xl mb-4">${recipe.strMeal}</h1>

    <div class="mt-2">
      <button class="recipe-tags text-sm">${recipe.strCategory}</button>
      <button class="recipe-tags text-sm">${recipe.strArea}</button>
    </div>

    <div class="flex flex-col rounded-md bg-primary max-w-100 h-auto sm:h-65 md:h-65 mt-4">
      <img src="${recipe.strMealThumb}" alt="${
    recipe.strMeal
  }" class="rounded-md object-cover w-full h-full" />
    </div>

    <div class="mt-6">
      <h2 class="font-bold text-xl mb-3 md:text-3xl">Ingredients</h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-lg text-gray-700">${ingredientsList}</ul>
    </div>

    <div class="mt-6">
      <h2 class="font-bold text-xl mb-3 md:text-3xl">Instructions</h2>
      <div class="text-sm md:text-lg text-gray-700">${instructions}</div>
    </div>
    
    ${youtubeEmbed} <!-- Only added if there's a valid tutorial -->

<h3 class="mt-10 text-lg font-semibold">Source:</h3> 
<p class="overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">
  <a href="${recipe.strSource}" target="_blank" class="text-blue-500 underline">
    ${recipe.strSource ? recipe.strSource : "Not available"}
  </a>
</p>

  `;
}
