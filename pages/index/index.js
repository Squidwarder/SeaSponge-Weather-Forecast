//index.js
//获取应用实例
const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  data: {
    nowTemperature: "",
    nowWeather: "",
    nowWeatherIcon: "",
    nowVis: "", //实况能见度，默认单位：公里
    nowPrecip: "", //实况降水量，默认单位：毫米
    nowHumidity: "", //实况相对湿度，百分比数值
    nowWindDir: "", //实况风向
    nowWindScale: "", //实况风力等级
    nowWindSpeed: "", //实况风速，公里/小时
    nowWind360: "", //实况风向360角度
    nowCloud: "", //实况云量，百分比数值
    nowFeelsLike: "", //实况体感温度
    nowPressure: "", //实况大气压强，默认单位：百帕
    forecastClass: [],
    todayDate: "",
    currentCityName: "北京市（默认）",
    currentCityID: "101010100",
    locationAuthType: UNPROMPTED
  },
  onPullDownRefresh () {
    this.getNow(()=> {
      wx.stopPullDownRefresh()
    })
  },
  onLoad () {
    this.qqmapsdk = new QQMapWX({
      key: "" //Insert personal developer key here for Tencent location service
    })
    wx.getSetting({
      success: res=> {
        let auth = res.authSetting["scope.userLocation"]
        console.log(auth)
        this.setData({
          locationAuthType: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED
        })
        if (auth) {
          this.getLocation()
        }
        else {
          this.getNow() //用默认城市北京市
        }
      },
      fail: ()=> {
        this.getNow() //用默认城市北京市
      }
    })
  },
  getNow(callback) {
    wx.request({
      url: 'https://devapi.heweather.net/v7/weather/now',
      data: {
        location: this.data.currentCityID,
        key: "" //Insert personal developer key here for heweather
      },
      success: res => {
        let result = res.data
        console.log(res.data)
        this.setNow(result)
        this.setDetails(result)
        this.setToday(result)
      },
      complete: ()=> {
        callback && callback()
      }
    })
  },
  setNow(result) {
    let temperature = result.now.temp
    let weather = result.now.text
    let weatherIcon = result.now.icon
    console.log(temperature, weather)
    this.setData({
      nowTemperature: temperature,
      nowWeather: weather,
      nowWeatherIcon: "/images/" + weatherIcon + ".png"
    })
  },
  setDetails(result) {
    //set Detailed Data
    this.setData({
      nowCloud: result.now.cloud,
      nowFeelsLike: result.now.feelsLike,
      nowHumidity: result.now.humidity,
      nowPrecip: result.now.precip,
      nowPressure: result.now.pressure,
      nowVis: result.now.vis,
      nowWind360: result.now.wind360,
      nowWindDir: result.now.windDir,
      nowWindScale: result.now.windScale,
      nowWindSpeed: result.now.windSpeed
    })
    wx.request({
      url: 'https://devapi.heweather.net/v7/weather/24h',
      data: {
        location: this.data.currentCityID,
        key: "" // Insert personal developer key here for heweather
      },
      success: res=> {
        let result = res.data
        let nowHour = new Date().getHours()
        let forecast = []
        console.log(res.data)
        for (var j = 0; j < 24; j++) {
          forecast.push({
            time: (j + nowHour) % 24 + "时", 
            weather:"/images/" + result.hourly[j].icon + ".png",
            temp: result.hourly[j].temp + "˚"
          })
        }
        forecast[0].time = "现在"
        this.setData({
          forecastClass: forecast
        })
      }
    })  
  },
  setToday(result) {
    let date = new Date()
    this.setData({
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: '/pages/list/list?location=' + this.data.currentCityID
    })
  },
  onTapLocation() {
    this.getLocation()
  },
  getLocation() {  
    wx.getLocation({
      success: res=> {
        this.setData({
          locationAuthType: AUTHORIZED
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res=> {
            let city = res.result.address_component.city
            console.log(city)
            this.setData({
              currentCityName: city
            })
            wx.request({
              url: "https://geoapi.heweather.net/v2/city/lookup",
              data: {
                location: this.data.currentCityName,
                key: "" // Insert personal developer key here for heweather
              },
              success: res => {
                console.log(res.data)
                this.setData({
                  currentCityID: res.data.location[0].id
                })
              }
            })
            this.getNow()
          }
        })
      },
      fail: ()=> {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
  }
})