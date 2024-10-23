const selectFolderButton = document.getElementById('select-folder');
const sections = {
    "SavedClips": document.getElementById("saved").querySelector(".timeline"),
    "SentryClips": document.getElementById("sentry").querySelector(".timeline"),
    "AllClips": document.getElementById("recent").querySelector(".timeline")
};

let videoFiles = {};

// 加载已保存的视频列表（如果存在）
function loadSavedVideoList() {
    videoFiles = JSON.parse(sessionStorage.getItem('videoFiles'));

    if (videoFiles) {
        loadEntries("SavedClips");
        loadEntries("SentryClips");
        loadEntries("AllClips");
    }
}

// 初始加载时恢复状态，这个需要，否则从视频播放页面退回时将是空白页面
window.onload = loadSavedVideoList;

selectFolderButton.addEventListener('click', async () => {
    // 调用 Electron API 选择文件夹
    videoFiles = await window.electronAPI.selectFolder();

    // 保存视频列表到sessionStorage本地应用运行期间都可以获取其中的内容
    sessionStorage.setItem('videoFiles', JSON.stringify(videoFiles));

    loadEntries("SavedClips");
    loadEntries("SentryClips");
    loadEntries("AllClips");
});

function loadEntries(videoType) {
    const pageSection = sections[videoType];
    const entries = videoFiles[videoType];

    pageSection.innerHTML = "";  // clear first

    let currentDate = ""; // To track the current date
    let entryContent = null; // To hold the entry content div

    // 倒序展示
    for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        const entryDate = entry.timestamp.split("_")[0]; // Extract date part (e.g., "2024-09-04")

        // If the date has changed, create a new date item
        if (entryDate !== currentDate) {
            currentDate = entryDate; // Update current date

            const dateItem = document.createElement("div");
            dateItem.classList.add("date-item");

            const dateSpan = document.createElement("span");
            dateSpan.classList.add("date");
            dateSpan.textContent = entryDate; // 1
            dateSpan.onclick = () => toggleEntry(entryDate);  // 2

            entryContent = document.createElement("div");
            entryContent.id = entryDate;  // 3 这三处一定要用entryDate而不是currentDate，currentDate是引用
            entryContent.classList.add("entry-content");

            dateItem.appendChild(dateSpan);
            dateItem.appendChild(entryContent);
            pageSection.appendChild(dateItem);
        }

        // Create video entry for the current entry
        const videoEntry = document.createElement("div");
        videoEntry.classList.add("video-entry");

        // Create a clickable link
        const link = document.createElement("a");
        link.href = `../video_player/index.html?type=${encodeURIComponent(videoType)}&index=${encodeURIComponent(i)}`;

        const timeDiv = document.createElement("div");
        timeDiv.classList.add("time");
        timeDiv.textContent = entry.timestamp.split("_")[1]; // Use time part

        const videoThumbnail = document.createElement("div");
        videoThumbnail.classList.add("video-thumbnail");

        const img = document.createElement("img");
        img.src = entry.thumbPath;
        img.alt = "Video Thumbnail";

        const durationDiv = document.createElement("div");
        durationDiv.classList.add("video-duration");
        durationDiv.textContent = entry.duration;

        videoThumbnail.appendChild(img);
        videoThumbnail.appendChild(durationDiv);
        link.appendChild(timeDiv);
        link.appendChild(videoThumbnail);
        videoEntry.appendChild(link); // Add the link to videoEntry
        entryContent.appendChild(videoEntry); // Add video entry to current entry content
    }
}

function showPage(page) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    // Show the selected page
    document.getElementById(page).classList.add('active');

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.header-buttons button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Add active class to the clicked button
    const clickedButton = document.querySelector(`.btn-${page}`);
    clickedButton.classList.add('active');
}

/// 效果
// 1. 翻转折叠/展开状态
// 2. 最多只展开一个
function toggleEntry(clickedDate) {
    const activeSection = document.querySelector('section.active');  // 只在当前选中的section中查找
    const allEntries = activeSection.querySelectorAll('.entry-content');

    allEntries.forEach(entry => {
        // If the entry's ID matches the clicked date, toggle it
        if (entry.id === clickedDate) {
            entry.style.display = entry.style.display === 'block' ? 'none' : 'block';
        } else {
            // Otherwise, collapse it
            entry.style.display = 'none';
        }
    });
}
// Default to showing the "Saved" page on load
document.addEventListener('DOMContentLoaded', () => {
    showPage('saved');
});