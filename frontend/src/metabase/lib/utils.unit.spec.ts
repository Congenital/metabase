import MetabaseUtils from "metabase/lib/utils";

describe("utils", () => {
  describe("compareVersions", () => {
    it("should compare versions correctly", () => {
      const expected = [
        "0.0.9",
        "0.0.10-snapshot",
        "0.0.10-alpha1",
        "0.0.10-rc1",
        "0.0.10-rc2",
        "0.0.10-rc10",
        "0.0.10",
        "0.1.0",
        "0.2.0",
        "0.10.0",
        "1.1.0",
      ];
      const shuffled = expected.slice();
      shuffle(shuffled);
      shuffled.sort(MetabaseUtils.compareVersions);
      expect(shuffled).toEqual(expected);
    });
  });

  it("should return 0 for equal versions", () => {
    expect(MetabaseUtils.compareVersions("v0.46.0", "v0.46.0")).toBe(0);
  });

  it("should compare majors", () => {
    expect(MetabaseUtils.compareVersions("v0.46.0", "v0.47.0")).toBe(-1);
    expect(MetabaseUtils.compareVersions("v0.47.0", "v0.46.0")).toBe(1);
  });

  it("should compare minors", () => {
    expect(MetabaseUtils.compareVersions("v0.46.0", "v0.46.1")).toBe(-1);
    expect(MetabaseUtils.compareVersions("v0.46.1", "v0.46.0")).toBe(1);
  });

  it("should consider X-beta < X", () => {
    expect(MetabaseUtils.compareVersions("v0.46.0-BETA", "v0.46.0")).toBe(-1);
  });

  it("should consider X-beta < X-RC", () => {
    expect(MetabaseUtils.compareVersions("v0.46.0-BETA", "v0.46.0-RC")).toBe(
      -1,
    );
  });

  it("should consider X-BETA1 < X-BETA2", () => {
    expect(
      MetabaseUtils.compareVersions("v0.46.0-BETA1", "v0.46.0-BETA2"),
    ).toBe(-1);
  });

  it("should consider X.BETA and X.0-BETA equal", () => {
    expect(MetabaseUtils.compareVersions("v0.46.0-BETA", "v0.46-BETA")).toBe(0);
  });

  it("should treat missing subversions as 0", () => {
    expect(MetabaseUtils.compareVersions("v0.46.0", "v0.46")).toBe(0);
    expect(MetabaseUtils.compareVersions("v0.46.2", "v0.46.2.0")).toBe(0);
    expect(MetabaseUtils.compareVersions("v0.46", "v0.46.1")).toBe(-1);
  });

  it("should consider v0.46-BETA1 < v0.46.0", () => {
    expect(MetabaseUtils.compareVersions("v0.46-BETA1", "v0.46.0")).toBe(-1);
  });

  it("should consider v0.46-BETA1 < v0.46.1-BETA1", () => {
    expect(MetabaseUtils.compareVersions("v0.46-BETA1 ", "v0.46.1-BETA1")).toBe(
      -1,
    );
  });

  describe("isEmpty", () => {
    it("should not allow all-blank strings", () => {
      expect(MetabaseUtils.isEmpty(" ")).toEqual(true);
    });
  });

  describe("isJWT", () => {
    it("should allow for JWT tokens with dashes", () => {
      expect(
        MetabaseUtils.isJWT(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXJhbXMiOnsicGFyYW0xIjoidGVzdCIsInBhcmFtMiI6ImFiIiwicGFyYW0zIjoiMjAwMC0wMC0wMFQwMDowMDowMCswMDowMCIsInBhcmFtNCI6Iu-8iO-8iSJ9LCJyZXNvdXJjZSI6eyJkYXNoYm9hcmQiOjB9fQ.wsNWliHJNwJBv_hx0sPo1EGY0nATdgEa31TM1AYotIA",
        ),
      ).toEqual(true);
    });
  });
});

function shuffle(a: string[]) {
  for (let i = a.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
}
