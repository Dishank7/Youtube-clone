//let apiKey = `AIzaSyDZtHfu6vFksjO6QjYgaWOca-qB5sJ1jW8`

const searchInput = document.getElementById("search-input");
let apiKey = `AIzaSyDZtHfu6vFksjO6QjYgaWOca-qB5sJ1jW8`
localStorage.setItem("api_key", apiKey);
const container = document.getElementById("container");

/*
    https://youtube.googleapis.com/youtube/v3/search?part=snippet,statistics&maxResults=1&q=mycodeschool&key=AIzaSyBprXFgJkoIn4TkCLOCXd9HLOujKmt9evk
*/
function searchVideos() {
  let searchValue = searchInput.value;
  // fetch the list of videos for this searchValue
  fetchVideos(searchValue);
}

async function fetchVideos(searchValue) {
  // make api call

  let endpoint = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${searchValue}&key=${apiKey}`;

  try {
    let response = await fetch(endpoint); // response is instance of Response class
    let result = await response.json();
    for(let i = 0 ; i < result.items.length; i++) {
        let video = result.items[i] ;
        let videoStats = await fetchStats(video.id.videoId)
        if(videoStats.items.length > 0)
            result.items[i].videoStats = videoStats.items[0].statistics; 
            result.items[i].duration = videoStats.items[0] && videoStats.items[0].contentDetails.duration
    }
    showThumbnails(result.items);
  } catch (error) {
    console.log("Something went wrong", error);
  }
}

function getViews(n){
    if(n < 1000) return n ;
    else if ( n >= 1000 && n <= 999999){
        n /= 1000;
        n = parseInt(n)
        return n+"K" ;
    }
    return parseInt(n / 1000000) + "M" ;
}

function showThumbnails(items) {
    container.innerHTML="";
  for (let i = 0; i < items.length; i++) {
    let videoItem = items[i];
    let imageUrl = videoItem.snippet.thumbnails.high.url;
    let videoElement = document.createElement("div");

    videoElement.addEventListener("click", () => {
      navigateToVideo(videoItem.id.videoId);
    })

    const videoChildren = `
        <img src="${imageUrl}" />
        <b>${formattedData(videoItem.duration)}</b>
        <p class="title">${videoItem.snippet.title}</p>
        <p class="channel-name">${videoItem.snippet.channelTitle}</p>
        <p class="view-count">${videoItem.videoStats ? getViews(videoItem.videoStats.viewCount) + "  Views": "NA"}</p>
    `;
    videoElement.innerHTML = videoChildren ;
    container.append(videoElement);
  }
}
async function fetchStats(videoId){ 
   const endpoint = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=statistics,contentDetails&id=${videoId}`;
   let response = await fetch(endpoint); 
   let result = await response.json();
   return result ;
}
function formattedData(duration) {
    if(!duration) return "NA" ;
    // PT2H33M23S
    // let hrs = duration.slice(2, 4);
    // let mins = duration.slice(5, 7);
    // let seconds ;
    // if(duration.length > 8){
    //     seconds = duration.slice(8, 10);
    // }
    // let str = `${hrs}:${mins}`;
    // seconds && (str += `:${seconds}`)
    // return str ;
    const pattern = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(pattern);

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (matches[1]) {
    hours = parseInt(matches[1]);
  }
  if (matches[2]) {
    minutes = parseInt(matches[2]);
  }
  if (matches[3]) {
    seconds = parseInt(matches[3]);
  }

  const timeFormat = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return timeFormat;

}
  
function navigateToVideo(videoId){
  let path = `/youtube-clone/video.html`;
  if(videoId){
 // video_id: video_id
    document.cookie = `video_id=${videoId}; path=${path}`
    let linkItem = document.createElement("a");
    linkItem.href = "http://127.0.0.1:5500/youtube-clone/video.html"
    linkItem.target = "_blank" ;
    linkItem.click();
  }
  else {
    alert("Go and watch in youtube")
  }
}