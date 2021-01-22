const CONTRIBUTORS = {
  sectionName: 'GROWI-cloud',
  sectionOrder: '',
  additionalClass: '',
  memberGroups: [
    {
      additionalClass: 'col-md-3 baba my-4',
      members: [
        { name: 'yuki-takei' },
        { name: 'TatsuyaIse' },
        { name: 'Yohei-Shiina' },
        { name: 'skomma' },
        { name: 'haruhikonyan' },
        { name: 'Shinichi Kondo' },
        { name: 'ryu-sato' },
        { name: 'kouki-o' },
        { name: 'Takayuki Tamura' },
        { name: 'itizawa' },
        { name: 'Ryo Hitotsumatsu' },
        { name: 'yamagai' },
        { name: 'Kazuki-Honma' },
        { name: 'kenta-o' },
        { name: 'yoshiro-s' },
        { name: 'keisuke uchida' },
        { name: 'ukyo-i' },
        { name: 'takahiro-k' },
        { name: 'kauzki-f' },
        { name: 'oshikishintaro' },
        { name: 'shukmos' },
      ],
    },
  ],
};
class StaffCreditService {

  getContributors() {
    return CONTRIBUTORS;
  }

}

module.exports = new StaffCreditService();
