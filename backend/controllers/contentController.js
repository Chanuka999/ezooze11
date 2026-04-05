const PageContent = require('../models/PageContent.js');

// @desc    Get page content
// @route   GET /api/content/:pageType
// @access  Public
const getPageContent = async (req, res) => {
  try {
    const content = await PageContent.findOne({ pageType: req.params.pageType });

    if (!content) {
      return res.status(404).json({ message: 'Page content not found' });
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update page content
// @route   PUT /api/content/:pageType
// @access  Private/Admin
const updatePageContent = async (req, res) => {
  try {
    let content = await PageContent.findOne({ pageType: req.params.pageType });

    if (!content) {
      content = await PageContent.create({ pageType: req.params.pageType, ...req.body });
    } else {
      Object.assign(content, req.body);
      await content.save();
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all page content
// @route   GET /api/content
// @access  Private/Admin
const getAllPageContent = async (req, res) => {
  try {
    const contents = await PageContent.find({});
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish/Unpublish page
// @route   PUT /api/content/:pageType/publish
// @access  Private/Admin
const togglePagePublish = async (req, res) => {
  try {
    const { isPublished } = req.body;

    const content = await PageContent.findOneAndUpdate(
      { pageType: req.params.pageType },
      { isPublished },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: 'Page content not found' });
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPageContent,
  updatePageContent,
  getAllPageContent,
  togglePagePublish,
};
