"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  
  let isFavorited = currentUser.isFavorite(story); 

  const hostName = story.getHostName();
  const unfavoriteStar = "far"
  const $favoriteStar = "fas"
  let star; 
  // if(isFavorited){
  //   star = $favoriteStar; 
  // }
  // else star = unfavoriteStar; 
  isFavorited ? star = $favoriteStar : star = unfavoriteStar; 
  return $(`
      <li id="${story.storyId}">
      <i class="${star} fa-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <i class="far fa-trash-alt"></i>
      </li><hr>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function storySubmit(e) {
  e.preventDefault();
  const title = $storyTitle.val();
  const author = $storyAuthor.val();
  const url = $storyUrl.val();
  
  $(this).closest("form").find("input[type=text], textarea").val("");
  const story = await storyList.addStory(currentUser, { title, author, url });
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
}


$storySubmitForm.on("submit", storySubmit);



async function showFavorites(e) {
  e.preventDefault();
  $favoriteList.empty();
  hidePageComponents();
  $favoriteList.show();
  if(currentUser.favorites.length === 0){
    $favoriteList.html("<h3>No Favorites Yet!</h3>")
  } else {
    for(let story of currentUser.favorites){
      const fav = generateStoryMarkup(story);
      $favoriteList.append(fav)
    }
  }
}
async function showMyStories(e) {
  e.preventDefault();

  $myStoriesList.empty();
  hidePageComponents();
  $myStoriesList.show();
  if(currentUser.ownStories.length === 0){
    $myStoriesList.html("<h3>No Stories Yet!</h3>")
  } else {
    for(let story of currentUser.ownStories){
      const ownStory = generateStoryMarkup(story);
      $myStoriesList.append(ownStory)
    }
  }
}

$allStoriesList.on("click", ".fa-star", async function (e) {
  e.preventDefault();
  $favoriteList.hide();
  const $id = $(this).closest("li").attr("id");

  const $story = storyList.stories.find((story) => story.storyId === $id);

  if($(this).hasClass('far')){
    $(this).toggleClass('far fas'); 
    await currentUser.addFavorite($story);
  } else {
    $(this).toggleClass('fas far'); 
    await currentUser.removeFavorite($story);
  }
});

$favoritesLink.on("click", showFavorites);

$myStoriesLink.on('click', showMyStories)

$allStoriesList.on("click", '.fa-trash-alt', async function(e){

  const $id = $(this).closest("li").attr("id");
  $(this).parent().remove();
  await storyList.deleteStory(currentUser, $id); 
  await putStoriesOnPage();

})

$('#nav-all').on('click', function(e){
  e.preventDefault();
  hidePageComponents()
  
})
