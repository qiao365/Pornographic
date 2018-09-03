## 数据
  * createuser -P qingyise -U postgres
  * createdb -O qingyise qingyise -U postgres
  
## ip port
  *192.168.1.25:8100

## 不需要登录
  * 1.图形验证码 get
  * /qingyi/account/recaptcha/captcha.jpg
  * body:{}

  * 2.获取列表 post
  * /qingyi/goods/list/:curPage/:limit


  * 3.获取列表 post by 城市 如：石景山
  * /qingyi/goods/list/by/area/:curPage/:limit
  * body:{"area":area}

  * 4.获取商品详情 get by id
  * qingyi/goods/list/item/details/:id

  * 5.注册 post
  * /qingyi/account/register
  * body： account/password/tip/captcha

  * 6.登录 post
  * /qingyi/account/login
  * header：
  * Authorization：Basic cWluZ3lpc2U6Z1gxZkJhdDNiVg==

  * body：username／password／grant_type=password／captcha

  * 7. 省份／市／区域 get
  * /qingyi/area/provinces

  * 8. 忘记密码  post
  * qingyi/account/fogetpass
  * body :  {account:account}

  * 9.根据城市获取区域 get  如：石家庄 返回：桥西区／桥东区 等
  * qingyi/get/citys/by/city/:city 


## 需要登录
   * 1.获取商品私密信息 get，购买则返回信息，无购买则返回提示信息
   * /qingyi/goods/list/item/private/:id

   * 2.购买商品 get, 购买成功后，直接返回私密信息，余额不足则返回余额不足
   * /qingyi/goods/list/item/private/bybuy/:id

   * 3.上传图片 post
   * /qingyi/file/upload

   * header:
   * content-Type:multipart/form-data
   * body {
    *  avatar:file
   * }

   * 4.上传商品信息 post
   *  /qingyi/goods/create
   * body：
 ```javascript
    title:
    name: 
    age:
    country:china
    province:
    city:
    seePrice: 游客看一次的单价
    brief:
    price:
    visitors
    serviceTime:
    service:
    describe:
    pictures:【string】
    qq:
    tel:
    wechat:
```

  * 5.个人中心-》eth打币地址 get，有地址则返回，没有 则 isSuccess:false
  * /qingyi/account/dobi/detailed



