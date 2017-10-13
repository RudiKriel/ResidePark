import { ResideParkCityPage } from './app.po';

describe('reside-park-city App', () => {
  let page: ResideParkCityPage;

  beforeEach(() => {
    page = new ResideParkCityPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
