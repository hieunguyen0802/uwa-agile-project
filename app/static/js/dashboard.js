// 队伍积分榜数据
const teamPointsData = [
    { team: '巴塞罗那', points: 24 },
    { team: '皇家马德里', points: 21 },
    { team: '曼城', points: 18 },
    { team: '利物浦', points: 16 },
    { team: '拜仁慕尼黑', points: 15 },
    { team: '多特蒙德', points: 12 },
    { team: '巴黎圣日耳曼', points: 10 },
    { team: '尤文图斯', points: 9 }
];

// 胜平负分布数据
const winDrawLossData = [
    { name: '胜', value: 14 },
    { name: '平', value: 6 },
    { name: '负', value: 4 }
];

// 球员进球数排行数据
const playerGoalsData = [
    { player: '梅西', team: '巴塞罗那', goals: 12 },
    { player: '莱万多夫斯基', team: '拜仁慕尼黑', goals: 10 },
    { player: '本泽马', team: '皇家马德里', goals: 8 },
    { player: '哈兰德', team: '曼城', goals: 8 },
    { player: '萨拉赫', team: '利物浦', goals: 7 }
];

// 球队数据雷达图数据
const radarData = [
    { item: '进攻', '巴塞罗那': 80, '皇家马德里': 70 },
    { item: '防守', '巴塞罗那': 60, '皇家马德里': 75 },
    { item: '传球', '巴塞罗那': 90, '皇家马德里': 80 },
    { item: '控球', '巴塞罗那': 85, '皇家马德里': 65 },
    { item: '体能', '巴塞罗那': 75, '皇家马德里': 85 },
    { item: '战术', '巴塞罗那': 82, '皇家马德里': 78 }
];

// 转换雷达图数据格式
function convertRadarData(data) {
    const result = [];
    data.forEach((d) => {
        result.push({
            item: d.item,
            team: '巴塞罗那',
            value: d['巴塞罗那']
        });
        result.push({
            item: d.item,
            team: '皇家马德里',
            value: d['皇家马德里']
        });
    });
    return result;
}

// 所有图表初始化函数
function initDashboardCharts() {
    // 确保G2Plot已加载
    if (typeof G2Plot === 'undefined') {
        console.error('G2Plot library not loaded!');
        return;
    }

    try {
        // 初始化队伍积分榜图表
        if (document.getElementById('teamPointsChart')) {
            const teamPointsChart = new G2Plot.Bar('teamPointsChart', {
                data: teamPointsData,
                xField: 'points',
                yField: 'team',
                seriesField: 'team',
                legend: false,
                color: ['#1890ff', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22'],
                label: {
                    position: 'right',
                    content: (data) => data.points
                },
                animation: {
                    appear: {
                        animation: 'fade-in',
                        duration: 1000
                    }
                }
            });
            teamPointsChart.render();
            console.log('Team points chart rendered');
        }

        // 初始化胜平负分布图表
        if (document.getElementById('winDrawLossChart')) {
            const winDrawLossChart = new G2Plot.Pie('winDrawLossChart', {
                data: winDrawLossData,
                angleField: 'value',
                colorField: 'name',
                radius: 0.8,
                color: ['#52c41a', '#faad14', '#f5222d'],
                label: {
                    type: 'outer',
                    content: '{name}: {percentage}'
                },
                legend: {
                    layout: 'horizontal',
                    position: 'bottom'
                },
                interactions: [{ type: 'element-active' }]
            });
            winDrawLossChart.render();
            console.log('Win-draw-loss chart rendered');
        }

        // 初始化球员进球数排行图表
        if (document.getElementById('playerGoalsChart')) {
            const playerGoalsChart = new G2Plot.Bar('playerGoalsChart', {
                data: playerGoalsData,
                xField: 'goals',
                yField: 'player',
                seriesField: 'team',
                legend: { position: 'top-right' },
                barStyle: {
                    radius: [2, 2, 0, 0]
                },
                label: {
                    position: 'right'
                },
                animation: {
                    appear: {
                        animation: 'wave-in',
                        duration: 1000
                    }
                }
            });
            playerGoalsChart.render();
            console.log('Player goals chart rendered');
        }

        // 初始化球队数据雷达图
        if (document.getElementById('teamRadarChart')) {
            const convertedRadarData = convertRadarData(radarData);
            const teamRadarChart = new G2Plot.Radar('teamRadarChart', {
                data: convertedRadarData,
                xField: 'item',
                yField: 'value',
                seriesField: 'team',
                meta: {
                    value: {
                        alias: '分数',
                        min: 0,
                        max: 100
                    }
                },
                xAxis: {
                    line: null,
                    tickLine: null
                },
                yAxis: {
                    grid: {
                        alternateColor: 'rgba(0, 0, 0, 0.04)'
                    }
                },
                point: {
                    size: 3
                },
                area: {}
            });
            teamRadarChart.render();
            console.log('Team radar chart rendered');
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// 在文档加载完成后初始化所有图表
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard DOM loaded, initializing charts...');
    setTimeout(initDashboardCharts, 500); // 增加短暂延迟确保DOM完全准备好
}); 