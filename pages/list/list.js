// pages/list/list.js
const dayMap = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"]
Page({
  data: {
    futureForecast: [],
    currentLocation: "广州市"
  },
  onLoad(options) {
    console.log(options.location)
    this.setData({
      currentLocation: options.location
    })
    this.getFutureForecast()
  },
  onPullDownRefresh() {
    console.log(this.data.city)
    this.getFutureForecast(()=> {
      wx.stopPullDownRefresh()
    })
  },
  getFutureForecast(callback) {
    wx.request({
      url: 'https://devapi.heweather.net/v7/weather/10d',
      data: {
        location: this.data.currentLocation,
        key: ""
      },
      success: res=> {
        let result = res.data
        console.log(res.data)
        this.setFutureForecast(result)
      },
      complete: ()=> {
        callback && callback()
      }
    })
  },
  setFutureForecast(result) {
    let futureForecast = []
    for (var i = 0; i < 10; i++) {
      let date = new Date()
      date.setDate(date.getDate() + i)
      futureForecast.push({
        futureDay: dayMap[date.getDay()],
        futureDate: `${date.getFullYear()} - ${date.getMonth()} - ${date.getDate()}`,
        futureTemp: `${result.daily[i].tempMin}˚ - ${result.daily[i].tempMax}˚`,
        futureWeatherIcon: "/images/" + result.daily[i].iconDay + ".png"
      })
    }
    futureForecast[0].futureDay = "今天"
    this.setData({
      futureForecast: futureForecast
    })
  }
})