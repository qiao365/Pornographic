## 数据
  * createuser -P qingyise -U postgres
  * createdb -O qingyise qingyise -U postgres
  
## ip port
  *192.168.1.25:8100

## 不需要登录
  * 1.图形验证码 get
  * se/account/recaptcha/captcha.svg

  * 2.获取列表 get
  * /se/goods/list/:curPage/:limit

  * 3.注册 post
  * se/account/register
  * body： account/password/tip/captcha

   * 4.登录 post
   * se/account/login
   * header：
   * Authorization：Basic cWluZ3lpc2U6Z1gxZkJhdDNiVg==

   * body：username／password／grant_type=password／captcha

## 需要登录
   * 1.获取商品私密信息 get，购买则返回信息，无购买则返回提示信息
   * se/goods/list/item/private/:id

   * 2.购买商品 get, 购买成功后，直接返回私密信息，余额不足则返回余额不足
   * /se/goods/list/item/private/bybuy/:id

   * 4.上传图片 post
   * se/file/upload

   * header:
   * content-Type:multipart/form-data
   * body {
    *  avatar:file
   * }

   * 5.上传商品信息 post
   *  se/goods/create
   * body：
 ```javascript
    name: 
    age:
    country:
    city:
    area:
    brief:
    price:
    serviceTime:
    service:
    describe:
    pictures:【string】
    qq:
    tel:
    wechat:
```

  * 6.个人中心-》eth打币地址 get，有地址则返回，没有 则 isSuccess:false
  * se/account/dobi/detailed



