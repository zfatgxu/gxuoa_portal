<template>
  <div class="efficiency-chart">
    <div class="module-header">
      <div class="title">
        <span>考核数据统计</span>
      </div>
      <div class="actions">
        <span class="more-link">更多 ></span>
      </div>
    </div>
    <div class="module-content">
      <div class="date-info">考核数据统计：2025-04-27</div>
      <div class="chart-container">
        <div class="chart-item">
          <div class="chart-circle">
            <svg viewBox="0 0 36 36" class="circular-chart green">
              <path 
                class="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path 
                class="circle"
                stroke-dasharray="100, 100"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" class="percentage">100%</text>
            </svg>
          </div>
          <div class="chart-label">责任机构回复率</div>
        </div>
        
        <div class="chart-item">
          <div class="chart-circle">
            <svg viewBox="0 0 36 36" class="circular-chart purple">
              <path 
                class="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path 
                class="circle"
                stroke-dasharray="0, 100"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" class="percentage">0%</text>
            </svg>
          </div>
          <div class="chart-label">应答率未实现占比</div>
        </div>
        
        <div class="chart-item">
          <div class="chart-circle">
            <svg viewBox="0 0 36 36" class="circular-chart blue">
              <path 
                class="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path 
                class="circle"
                stroke-dasharray="33.33, 100"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" class="percentage">33.33%</text>
            </svg>
          </div>
          <div class="chart-label">部门单条办结占比</div>
        </div>
        
        <div class="chart-item">
          <div class="chart-circle">
            <svg viewBox="0 0 36 36" class="circular-chart pink">
              <path 
                class="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path 
                class="circle"
                stroke-dasharray="100, 100"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" class="percentage">100%</text>
            </svg>
          </div>
          <div class="chart-label">一次性办结率</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'EfficiencyChart' })

// 这里可以添加图表相关的逻辑
</script>

<style lang="scss" scoped>
.efficiency-chart {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  
  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #e6e6e6;
    
    .title {
      font-weight: bold;
      font-size: 16px;
      color: #303133;
    }
    
    .actions {
      .module-title {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }
  
  .module-content {
    padding: 15px;
    
    .date-info {
      font-size: 12px;
      color: #606266;
      margin-bottom: 20px;
    }
    
    .chart-container {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      
      .chart-item {
        width: 25%;
        text-align: center;
        
        .chart-circle {
          margin: 0 auto;
          width: 100px;
          height: 100px;
          
          .circular-chart {
            display: block;
            margin: 0 auto;
            max-width: 100%;
            max-height: 100%;
          }
          
          .circle-bg {
            fill: none;
            stroke: #eee;
            stroke-width: 3.8;
          }
          
          .circle {
            fill: none;
            stroke-width: 2.8;
            stroke-linecap: round;
            animation: progress 1s ease-out forwards;
          }
          
          .circular-chart.green .circle {
            stroke: #4CC790;
          }
          
          .circular-chart.purple .circle {
            stroke: #F2A5C8;
          }
          
          .circular-chart.blue .circle {
            stroke: #3c9ee5;
          }
          
          .circular-chart.pink .circle {
            stroke: #F06292;
          }
          
          .percentage {
            fill: #666;
            font-family: sans-serif;
            font-size: 0.5em;
            text-anchor: middle;
          }
        }
        
        .chart-label {
          margin-top: 10px;
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}
</style>
