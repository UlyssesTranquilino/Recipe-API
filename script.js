let data = null;

const getCategory = async (category) => {
  try {
    const recipeData = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );

    if (!recipeData.ok) {
      throw new Error("Could not get recipes");
    }

    data = await recipeData.json();
    displayRecipeCards();
    console.log("DATA: ", data);
  } catch (error) {
    console.log("Error: ", error);
  }
};

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

function displayRecipeCards() {
  const container = document.getElementById("data");
  container.innerHTML = ""; // Clear previous data

  if (!data.meals) {
    container.innerHTML = "<p>No recipes found</p>";
    return;
  }

  data.meals.slice(4, 16).forEach((meal) => {
    const mealCard = document.createElement("div");
    mealCard.classList.add("recipe-card");

    mealCard.innerHTML = `
      <div class="flex flex-col rounded-md bg-primary h-55 sm:h-65 md:h-65 cursor-pointer shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-transform duration-300 ease-in-out">
        <div class="h-35 sm:h-45">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-image rounded-t-md object-cover w-full h-full">
        </div>

        <div class="p-2 mt-3"> 
          <h3 class="font-semibold text-sm sm:text-md md:text-sm lg:text-lg">${meal.strMeal}</h3>
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

const showRecipe = async (recipeName) => {
  try {
    console.log("Fetching recipe:", recipeName);

    // Fetch detailed recipe info based on the recipe name
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${recipeName}`
    );
    const data = await response.json();

    if (data.meals) {
      const recipe = data.meals[0];
      displaySingleRecipe(recipe); // Pass the recipe to the displaySingleRecipe function
    } else {
      console.log("Recipe not found");
    }
  } catch (error) {
    console.log("Error fetching recipe:", error);
  }
};

const searchRecipe = async () => {
  try {
    const searchQuery = document.getElementById("searchInput").value.trim();

    if (!searchQuery) {
      console.log("Please enter a search term.");
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
      console.log("No results found.");
      singleRecipeContainer.innerHTML =
        "<p class='text-center text-red-500'>No recipes found.</p>";
      return;
    }

    displaySingleRecipe(data.meals[0]); // Show the searched recipe
  } catch (error) {
    console.log("Error: ", error);
  }
};

function displaySingleRecipe(recipeData) {
  const container = document.getElementById("singleRecipe");
  container.innerHTML = ""; // Clear previous data

  if (!recipeData || recipeData.length === 0) {
    container.innerHTML =
      "<p class='text-center text-red-500 font-semibold'>No recipes found</p>";
    return;
  }

  const recipe = recipeData;

  // Generate ingredient list dynamically
  let ingredientsList = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];

    if (ingredient && ingredient.trim() !== "") {
      ingredientsList += `<li>${measure} ${ingredient}</li>`;
    }
  }

  // Proper spacing for instructions - wrap in separate <p> tags
  const instructions = recipe.strInstructions
    .split(/\r\n|\n/) // Split at line breaks
    .map((line) => `<p class="mb-4">${line}</p>`) // Wrap each in <p> with margin-bottom
    .join(""); // Join back as a string

  // Extract YouTube video ID from URL
  const youtubeUrl = recipe.strYoutube;
  let youtubeEmbed = "";
  if (youtubeUrl) {
    const videoId = youtubeUrl.split("v=")[1]?.split("&")[0]; // Extract video ID
    youtubeEmbed = `
      <div class="mt-4">
        <iframe 
          class="w-full h-56 sm:h-80 lg:h-85 md:w-140 rounded-md border-0" 
          src="https://www.youtube.com/embed/${videoId}" 
          frameborder="0" 
          allowfullscreen>
        </iframe>
      </div>
    `;
  }

  // Create recipe HTML
  container.innerHTML = `
    <h1 class="font-semibold text-4xl mb-4">${recipe.strMeal}</h1>

    <div class="mt-2">
      <button class="recipe-tags text-sm">${recipe.strCategory}</button>
      <button class="recipe-tags text-sm">${recipe.strArea}</button>
    </div>

    <div class="flex flex-col rounded-md bg-primary max-w-100 h-auto sm:h-65 md:h-65 mt-4">
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="rounded-md object-cover w-full h-full" />
    </div>



    <div class="mt-6">
      <h2 class="font-bold text-xl mb-3 md:text-3xl">Ingredients</h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-lg text-gray-700">${ingredientsList}</ul>
    </div>

        <div class="mt-6">
      <h2 class="font-bold text-xl mb-3 md:text-3xl">Instructions</h2>
      <div class="text-sm md:text-lg text-gray-700">${instructions}</div>
    </div>
    
    <div class="mt-6">
      <h2 class="font-bold text-xl md:text-3xl mb-3">Watch Tutorial</h2>
      ${youtubeEmbed}
    </div>
  `;
}
