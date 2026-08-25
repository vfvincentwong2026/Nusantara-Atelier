# 常见问题 · FAQ

## 中文

### Q1: 这个网站是做什么的？

Nusantara Atelier 是一个 AI 驱动的印尼豪宅设计网站。客户上传户型图或照片，系统自动生成设计方案、物料清单和报价预算。


### Q2: 需要注册才能使用吗？

不需要。客户直接打开网站即可使用，无需注册。


### Q3: 支持哪些文件格式？

支持 JPG、PNG、PDF、DXF 格式。


### Q4: 报价准确吗？

我们的报价基于真实成交的案例数据（单方造价 × 面积），并考虑了风格、地区、档次等系数，具有较高的参考价值。


### Q5: 报价结果可以导出吗？

可以。支持导出为 PDF 格式，方便客户保存或分享。


### Q6: 你们在印尼有落地项目吗？

目前我们拥有丰富的中国豪宅案例库。印尼本地项目正在拓展中，欢迎咨询合作。


### Q7: 设计需要多长时间？

从上传文件到获得设计方案和报价，整个过程约 30 分钟。


### Q8: 我可以预约设计师吗？

可以。在获得报价后，点击"预约设计师"按钮，填写联系方式，我们的设计师将在 24 小时内与您联系。


### Q9: 这个服务收费吗？

初步估价和设计方案展示是免费的。如需深化设计服务，将有专业团队与您沟通具体费用。


### Q10: 案例库会更新吗？

会。我们会持续收集和整理新的落地项目，不断丰富案例库。

---

## English

### Q1: What does this website do?

Nusantara Atelier is an AI-powered luxury villa design website. Clients upload floor plans or photos, and the system automatically generates design proposals, material lists, and budget quotes.


### Q2: Do I need to register?

No. Clients can use the website directly without registration.


### Q3: What file formats are supported?

JPG, PNG, PDF, and DXF formats are supported.


### Q4: How accurate is the quote?

Our quotes are based on real transaction data (cost per sqm × area), adjusted for style, location, and tier, providing highly reliable estimates.


### Q5: Can I export the quote?

Yes. Supports PDF export for saving or sharing.


### Q6: Do you have projects in Indonesia?

We currently have a rich case library from China. Indonesian local projects are in development — feel free to inquire about partnerships.


### Q7: How long does the design take?

From file upload to receiving design and quote, approximately 30 minutes.


### Q8: Can I book a designer?

Yes. After receiving the quote, click the "Book a Designer" button and fill in your contact information. Our designer will contact you within 24 hours.


### Q9: Is this service free?

Initial estimation and design proposal display are free. For in-depth design services, our professional team will discuss specific fees with you.


### Q10: Will the case library be updated?

Yes. We continuously collect and organize new completed projects to enrich the case library.


## 🔗 相关文档

- [项目介绍](PROJECT_DESCRIPTION.md)
- [案例展示](CASES.md)
✅ 下一步操作
删除错误的目录：

bash
git rm -rf '`docs'
创建正确的 docs 目录（如果不存在）：

bash
mkdir -p docs
将所有文档添加到 docs/，然后提交：

bash
git add docs/
git add .github/
git commit -m "docs: add complete documentation
- PROJECT_DESCRIPTION.md: project overview with case library
- ARCHITECTURE.md: technical architecture
- DATA_MODEL.md: data models and 18 cases
- API.md: API documentation
- CASES.md: case gallery
- FAQ.md: bilingual FAQ
- add issue templates and PR template"
git push
