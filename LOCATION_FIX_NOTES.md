# Vedic Light - 位置搜索功能修复

## 修复内容

### 问题描述
natal页面中包含了大量未使用的层级选择代码，导致：
1. 页面中存在未定义的状态变量（selectedCountry, selectedProvince, selectedCity, provinces, cities）
2. 大量冗余代码占用空间
3. 页面加载和编译可能出现错误

### 修复方案
恢复使用基于全球地图API的位置搜索功能：
- 使用OpenStreetMap的Nominatim API进行全球位置搜索
- 支持输入任意位置（中文、英文均可）
- 自动生成多种搜索查询变体
- 智能地址格式化
- 自动计算时区

### 保留的功能
1. handleLocationSearch() - 位置搜索函数
2. buildSearchQueries() - 查询构建函数
3. simpleFormatAddress() - 地址格式化函数
4. reverseGeocode() - 逆地理编码函数
5. handleAutoLocation() - 自动定位函数
6. handleSelectLocation() - 位置选择函数

### 需要删除的代码
从第289行到第487行的所有层级选择相关代码：
- loadProvinces() 函数
- loadCities() 函数  
- selectCity() 函数
- 以及相关的状态变量声明

### 表单恢复
恢复使用简单的文本输入框+搜索建议下拉列表的方式，而不是复杂的层级选择。

## 下一步
需要手动删除从第289行到第487行的代码，或者重新生成natal/page.tsx文件。
