// 获取元素
const rankCards = document.querySelectorAll('.rank-card');
const modalOverlay = document.querySelector('.modal-overlay');
const closeBtn = document.querySelector('.close-btn');

// 打开模态框
rankCards.forEach(card => {
  card.addEventListener('click', () => {
    const title = card.querySelector('h3').textContent;
    document.getElementById('modal-title').textContent = title;
    modalOverlay.style.display = 'flex'; // 显示模态框
  });
});

// 关闭模态框
closeBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});

// 点击背景关闭
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = 'none';
  }
});


// 模拟榜单数据
const rankData = {
  rising: ['孤勇者', '雪 Distance', '凄美地'],
  new: ['悬溺', '奢香夫人', '兰亭序'],
  classic: ['后来', '朋友', '海阔天空']
};

// 生成歌曲列表（在点击时调用）
function renderSongs(type) {
  const songList = document.querySelector('.song-list');
  songList.innerHTML = ''; // 清空原有内容
  
  rankData[type].forEach((song, index) => {
    const li = document.createElement('li');
    li.className = 'song-item';
    li.textContent = `${index+1}. ${song}`;
    songList.appendChild(li);
  });
}

// 修改点击事件，传入榜单类型
rankCards.forEach((card, index) => {
  const type = ['rising', 'new', 'classic'][index];
  card.addEventListener('click', () => {
    renderSongs(type); // 动态加载对应榜单歌曲
    modalOverlay.style.display = 'flex';
  });
});