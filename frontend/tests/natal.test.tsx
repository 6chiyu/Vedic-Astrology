import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import NatalPage from "../app/natal/page";

const printSpy = vi.fn();
const focusSpy = vi.fn();
const documentOpenSpy = vi.fn();
const documentWriteSpy = vi.fn();
const documentCloseSpy = vi.fn();
const openSpy = vi.fn(() => ({
  document: {
    open: documentOpenSpy,
    write: documentWriteSpy,
    close: documentCloseSpy,
  },
  focus: focusSpy,
  print: printSpy,
  onload: null as null | (() => void),
}));

const fullHouseData = [
  {
    house: 1,
    sign: "Leo",
    lord: "Sun",
    nakshatra: "Magha",
    pada: 4,
    sign_degrees: 11.44,
    bhava_bala: 613.581,
    occupants: [],
  },
  {
    house: 2,
    sign: "Virgo",
    lord: "Mercury",
    nakshatra: "Uttara Phalguni",
    pada: 2,
    sign_degrees: 8.15,
    bhava_bala: 520.12,
    occupants: [],
  },
  {
    house: 3,
    sign: "Libra",
    lord: "Venus",
    nakshatra: "Swati",
    pada: 1,
    sign_degrees: 4.2,
    bhava_bala: 488.1,
    occupants: ["Mars"],
  },
  {
    house: 4,
    sign: "Scorpio",
    lord: "Mars",
    nakshatra: "Anuradha",
    pada: 3,
    sign_degrees: 18.8,
    bhava_bala: 577.8,
    occupants: [],
  },
  {
    house: 5,
    sign: "Sagittarius",
    lord: "Jupiter",
    nakshatra: "Mula",
    pada: 2,
    sign_degrees: 2.5,
    bhava_bala: 544.4,
    occupants: ["Ketu"],
  },
  {
    house: 6,
    sign: "Capricorn",
    lord: "Saturn",
    nakshatra: "Shravana",
    pada: 4,
    sign_degrees: 21.9,
    bhava_bala: 501.5,
    occupants: ["Moon"],
  },
  {
    house: 7,
    sign: "Aquarius",
    lord: "Saturn",
    nakshatra: "Shatabhisha",
    pada: 1,
    sign_degrees: 6.75,
    bhava_bala: 455.2,
    occupants: ["Saturn"],
  },
  {
    house: 8,
    sign: "Pisces",
    lord: "Jupiter",
    nakshatra: "Revati",
    pada: 2,
    sign_degrees: 12.25,
    bhava_bala: 430.8,
    occupants: [],
  },
  {
    house: 9,
    sign: "Aries",
    lord: "Mars",
    nakshatra: "Ashwini",
    pada: 3,
    sign_degrees: 28.4,
    bhava_bala: 548.8,
    occupants: ["Venus"],
  },
  {
    house: 10,
    sign: "Taurus",
    lord: "Venus",
    nakshatra: "Rohini",
    pada: 2,
    sign_degrees: 16.05,
    bhava_bala: 612.2,
    occupants: ["Mercury"],
  },
  {
    house: 11,
    sign: "Gemini",
    lord: "Mercury",
    nakshatra: "Ardra",
    pada: 2,
    sign_degrees: 5.12,
    bhava_bala: 590.4,
    occupants: ["Sun", "Jupiter"],
  },
  {
    house: 12,
    sign: "Cancer",
    lord: "Moon",
    nakshatra: "Pushya",
    pada: 4,
    sign_degrees: 24.33,
    bhava_bala: 467.6,
    occupants: ["Rahu"],
  },
];

const fullPlanetData = [
  {
    planet: "Sun",
    house: 11,
    sign: "Gemini",
    degrees: 5.12,
    nakshatra: "Ardra",
    pada: 2,
    motion_type: "direct",
    dignity: "friendly",
    lordship_houses: [1],
  },
  {
    planet: "Moon",
    house: 6,
    sign: "Capricorn",
    degrees: 22.44,
    nakshatra: "Dhanishta",
    pada: 1,
    motion_type: "direct",
    dignity: "neutral",
    lordship_houses: [12],
  },
  {
    planet: "Mars",
    house: 3,
    sign: "Libra",
    degrees: 14.31,
    nakshatra: "Swati",
    pada: 3,
    motion_type: "direct",
    dignity: "neutral",
    lordship_houses: [4, 9],
  },
  {
    planet: "Mercury",
    house: 10,
    sign: "Taurus",
    degrees: 19.05,
    nakshatra: "Rohini",
    pada: 3,
    motion_type: "direct",
    dignity: "friendly",
    lordship_houses: [2, 11],
  },
  {
    planet: "Jupiter",
    house: 11,
    sign: "Gemini",
    degrees: 27.58,
    nakshatra: "Punarvasu",
    pada: 3,
    motion_type: "direct",
    dignity: "neutral",
    lordship_houses: [5, 8],
  },
  {
    planet: "Venus",
    house: 9,
    sign: "Aries",
    degrees: 9.41,
    nakshatra: "Ashwini",
    pada: 3,
    motion_type: "direct",
    dignity: "neutral",
    lordship_houses: [3, 10],
  },
  {
    planet: "Saturn",
    house: 7,
    sign: "Aquarius",
    degrees: 11.09,
    nakshatra: "Shatabhisha",
    pada: 2,
    motion_type: "retrograde",
    dignity: "own-sign",
    lordship_houses: [6, 7],
  },
  {
    planet: "Rahu",
    house: 12,
    sign: "Cancer",
    degrees: 17.5,
    nakshatra: "Ashlesha",
    pada: 1,
    motion_type: "retrograde",
    dignity: "shadow",
    lordship_houses: [],
  },
  {
    planet: "Ketu",
    house: 5,
    sign: "Sagittarius",
    degrees: 17.5,
    nakshatra: "Purva Ashadha",
    pada: 3,
    motion_type: "retrograde",
    dignity: "shadow",
    lordship_houses: [],
  },
];

describe("NatalPage", () => {
  beforeEach(() => {
    openSpy.mockClear();
    printSpy.mockClear();
    focusSpy.mockClear();
    documentOpenSpy.mockClear();
    documentWriteSpy.mockClear();
    documentCloseSpy.mockClear();
    vi.stubGlobal("open", openSpy);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes("nominatim.openstreetmap.org/search")) {
          return {
            ok: true,
            json: async () => [
              {
                place_id: 1,
                display_name: "Shanghai, China",
                lat: "31.2304",
                lon: "121.4737",
                address: { country: "China" },
              },
            ],
          };
        }

        if (url.includes("nominatim.openstreetmap.org/reverse")) {
          return {
            ok: true,
            json: async () => ({
              display_name: "Shanghai, China",
            }),
          };
        }

        if (url.includes("/api/v1/birth-chart")) {
          return {
            ok: true,
            json: async () => ({
              code: 0,
              data: {
                profile: {
                  name: "Test User",
                  birth_date: "1996-07-04",
                  birth_time: "09:10:00",
                  latitude: 31.2304,
                  longitude: 121.4737,
                  timezone_offset: 8,
                },
                chart: {
                  lagna_sign: "Leo",
                  moon_sign: "Capricorn",
                  sun_sign: "Gemini",
                  planets: fullPlanetData,
                  houses: fullHouseData,
                  divisional_charts: [
                    {
                      chart_key: "d9",
                      label: "Navamsa relationship chart",
                      ascendant_sign: "Cancer",
                      source_house: 12,
                      focus: "Used to supplement relationship interpretation.",
                    },
                    {
                      chart_key: "d10",
                      label: "Dasamsa career chart",
                      ascendant_sign: "Taurus",
                      source_house: 10,
                      focus: "Used to supplement public role and career interpretation.",
                    },
                  ],
                },
                panchanga: {
                  nakshatra: "Dhanishta",
                  tithi: "Krishna Chaturthi",
                  yoga: "Priti",
                  karana: "Bava",
                  vara: "Thursday",
                },
                dasha: {
                  current: "Jupiter / Venus / Venus",
                  mahadasha: {
                    name: "Jupiter",
                    start: "2018-04-14",
                    end: "2034-04-14",
                  },
                  antardasha: {
                    name: "Venus",
                    start: "2025-01-10",
                    end: "2027-11-02",
                  },
                  pratyantardasha: {
                    name: "Venus",
                    start: "2026-04-03",
                    end: "2026-09-18",
                  },
                },
                meta: {
                  engine: "jyotishganit",
                  ayanamsa: "True Chitra Paksha (23.842°)",
                  available_modules: ["D1", "Panchanga", "Vimshottari Dasha", "D9"],
                  report_scope: ["core"],
                },
              },
            }),
          };
        }

        if (url.includes("/api/v1/chart-reading")) {
          return {
            ok: true,
            json: async () => ({
              code: 0,
              data: {
                answer:
                  "好的，刘柳，茶已经泡好了。\n\n> 分析范围：D1本命盘、D9 Navamsa婚姻盘\n\n---\n\n## 为什么？ 四条核心证据\n\n### 1. 你的“朋友圈”就是你的“发动机”\n\n你的能量来源是“连接”。",
                model: "deepseek-v4-flash",
                focus: "core",
                skill_bundle: {
                  name: "vedic-core",
                  path: "D:/skills/vedic-core",
                  mode: "deepseek",
                },
              },
            }),
          };
        }

        if (url.includes("/api/v1/birth-time-rectifier/dialogue")) {
          const requestBody =
            input instanceof Request && typeof input.json === "function"
              ? await input.json()
              : JSON.parse(String(init?.body ?? "{}"));
          const messages = Array.isArray(requestBody.messages)
            ? requestBody.messages
            : [];

          if (messages.length === 0) {
            return {
              ok: true,
              json: async () => ({
                code: 0,
                data: {
                  assistant_message:
                    "先说一个最早明显改变你人生轨迹的事件。时间大概在什么时候，发生了什么？",
                  should_continue: true,
                  confidence: "low",
                  suggested_time: "",
                  time_range: "",
                  summary: "",
                  rationale: [],
                  next_steps: [],
                  events: [],
                  model: "deepseek-v4-flash",
                  skill_bundle: {
                    name: "vedic-rectifier",
                    path: "D:/skills/vedic-rectifier",
                    mode: "deepseek",
                  },
                },
              }),
            };
          }

          if (messages.length === 2) {
            return {
              ok: true,
              json: async () => ({
                code: 0,
                data: {
                  assistant_message:
                    "这条迁移线索很关键。再说一个事业、学业或现实压力很强的转折点，尽量带上年份。",
                  should_continue: true,
                  confidence: "low",
                  suggested_time: "",
                  time_range: "",
                  summary: "",
                  rationale: [],
                  next_steps: [],
                  events: [
                    {
                      title: "童年迁移",
                      date_hint: "2022",
                      description: "去职高读书，第一次长期离开家。",
                    },
                  ],
                  model: "deepseek-v4-flash",
                  skill_bundle: {
                    name: "vedic-rectifier",
                    path: "D:/skills/vedic-rectifier",
                    mode: "deepseek",
                  },
                },
              }),
            };
          }

          if (messages.length === 4) {
            return {
              ok: true,
              json: async () => ({
                code: 0,
                data: {
                  assistant_message:
                    "我还需要一个关系或家庭上的关键节点。它发生在什么时候，又怎样改变了你？",
                  should_continue: true,
                  confidence: "low",
                  suggested_time: "",
                  time_range: "",
                  summary: "",
                  rationale: [],
                  next_steps: [],
                  events: [
                    {
                      title: "童年迁移",
                      date_hint: "2022",
                      description: "去职高读书，第一次长期离开家。",
                    },
                    {
                      title: "学业分流",
                      date_hint: "2024",
                      description: "正式进入喜欢的学校和专业，现实路径明显改变。",
                    },
                  ],
                  model: "deepseek-v4-flash",
                  skill_bundle: {
                    name: "vedic-rectifier",
                    path: "D:/skills/vedic-rectifier",
                    mode: "deepseek",
                  },
                },
              }),
            };
          }

          return {
            ok: true,
            json: async () => ({
              code: 0,
              data: {
                assistant_message:
                  "现在我已经能给出一个当前最可信的时间判断了，后面如果你还能补充健康或家庭变故事件，我们还可以继续缩小范围。",
                should_continue: false,
                suggested_time: "09:16",
                time_range: "09:12 - 09:20",
                confidence: "medium",
                summary: "综合迁移、学业分流和关系节点，这个时间比原始录入更贴近事件顺序。",
                rationale: ["多个关键节点集中落在更晚一点的上升敏感带。"],
                next_steps: ["用新时间重看 D1 和 D9。"],
                events: [
                  {
                    title: "童年迁移",
                    date_hint: "2022",
                    description: "去职高读书，第一次长期离开家。",
                  },
                  {
                    title: "学业分流",
                    date_hint: "2024",
                    description: "进入喜欢的学校和专业，路径改变明显。",
                  },
                  {
                    title: "关系转折",
                    date_hint: "2025",
                    description: "和重要的人分开，情感状态明显改变。",
                  },
                ],
                model: "deepseek-v4-flash",
                skill_bundle: {
                  name: "vedic-rectifier",
                  path: "D:/skills/vedic-rectifier",
                  mode: "deepseek",
                },
              },
            }),
          };
        }

        return {
          ok: true,
          json: async () => ({
            code: 0,
            data: {
              profile: {
                name: "Test User",
                birth_date: "1996-07-04",
                birth_time: "09:10:00",
                latitude: 31.2304,
                longitude: 121.4737,
                timezone_offset: 8,
              },
              chart: {
                lagna_sign: "Leo",
                moon_sign: "Capricorn",
                sun_sign: "Gemini",
                houses: fullHouseData,
                planets: fullPlanetData,
                divisional_charts: [
                  {
                    chart_key: "d9",
                    label: "Navamsa relationship chart",
                    ascendant_sign: "Cancer",
                    source_house: 12,
                    focus: "Used to supplement relationship interpretation.",
                  },
                  {
                    chart_key: "d10",
                    label: "Dasamsa career chart",
                    ascendant_sign: "Taurus",
                    source_house: 10,
                    focus: "Used to supplement public role and career interpretation.",
                  },
                ],
              },
              panchanga: {
                nakshatra: "Dhanishta",
                tithi: "Krishna Chaturthi",
                yoga: "Priti",
                karana: "Bava",
                vaara: "Thursday",
              },
              dasha: {
                current: "Jupiter / Venus / Venus",
                mahadasha: {
                  name: "Jupiter",
                  start: "2018-04-14",
                  end: "2034-04-14",
                },
                antardasha: {
                  name: "Venus",
                  start: "2025-01-10",
                  end: "2027-11-02",
                },
                pratyantardasha: {
                  name: "Venus",
                  start: "2026-04-03",
                  end: "2026-09-18",
                },
              },
              meta: {
                engine: "jyotishganit",
                ayanamsa: "True Chitra Paksha (23.842°)",
                available_modules: ["D1", "Panchanga", "Vimshottari Dasha", "D9"],
                report_scope: ["core"],
              },
            },
          }),
        };
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("submits chart data and shows a fuller standard natal chart", async () => {
    const { container } = render(<NatalPage />);
    
    // 使用 ID 选择器而不是索引，更稳定
    fireEvent.change(container.querySelector<HTMLInputElement>("#name")!, { target: { value: "Test User" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#location")!, { target: { value: "Shanghai" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#birth-date")!, { target: { value: "1996-07-04" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#birth-time")!, { target: { value: "09:10" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#latitude")!, { target: { value: "31.2304" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#longitude")!, { target: { value: "121.4737" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#timezone")!, { target: { value: "8" } });

    const submitButton = container.querySelector('button[type="submit"]');

    expect(submitButton).not.toBeNull();
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/birth-chart",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    expect(await screen.findByText("Jupiter / Venus / Venus")).toBeInTheDocument();

    const tableBodies = container.querySelectorAll("tbody");
    expect(tableBodies.length).toBeGreaterThanOrEqual(3);
    expect(within(tableBodies[0]!).getAllByRole("row")).toHaveLength(12);
    expect(within(tableBodies[1]!).getAllByRole("row")).toHaveLength(9);

    expect(within(tableBodies[1]!).getByText("Rahu")).toBeInTheDocument();
    expect(within(tableBodies[1]!).getByText("Ketu")).toBeInTheDocument();
    expect(screen.getByText(/2018-04-14/)).toBeInTheDocument();
    expect(screen.getByText(/2034-04-14/)).toBeInTheDocument();
    expect(screen.getAllByText("付费解锁").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /去开启 AI 深读/i })).toBeInTheDocument();
  });

  it("fills coordinates from a suggested birthplace", async () => {
    const { container } = render(<NatalPage />);
    const locationInput = container.querySelector<HTMLInputElement>("#location");

    expect(locationInput).not.toBeNull();
    fireEvent.change(locationInput!, { target: { value: "Shanghai" } });

    const suggestion = await screen.findByRole("button", {
      name: /Shanghai, China/i,
    });
    fireEvent.click(suggestion);

    expect(container.querySelector<HTMLInputElement>("#latitude")?.value).toBe("31.2304");
    expect(container.querySelector<HTMLInputElement>("#longitude")?.value).toBe("121.4737");
    expect(container.querySelector<HTMLInputElement>("#timezone")?.value).toBe("8");
  });

  it("locks AI time rectification behind a paid upgrade", async () => {
    const { container } = render(<NatalPage />);
    
    fireEvent.change(container.querySelector<HTMLInputElement>("#name")!, { target: { value: "Test User" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#location")!, { target: { value: "Shanghai" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#birth-date")!, { target: { value: "1996-07-04" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#birth-time")!, { target: { value: "09:10" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#latitude")!, { target: { value: "31.2304" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#longitude")!, { target: { value: "121.4737" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#timezone")!, { target: { value: "8" } });

    const submitButton = container.querySelector('button[type="submit"]');
    fireEvent.click(submitButton!);

    await screen.findByText("Jupiter / Venus / Venus");

    const rectifyButton = screen.getByRole("button", { name: /开始 AI 校时/i });
    expect(rectifyButton).toBeDisabled();
    expect(screen.getAllByText("Paid Unlock").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /开启 AI 对话校时/i })).toBeInTheDocument();
    expect(screen.queryByText("09:16")).not.toBeInTheDocument();
    expect(screen.queryByText("09:12 - 09:20")).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/v1/birth-time-rectifier/dialogue",
      expect.anything()
    );
  });

  it("allows bypassing paid features with the test unlock button", async () => {
    const { container } = render(<NatalPage />);
    
    fireEvent.change(container.querySelector<HTMLInputElement>("#name")!, { target: { value: "Test User" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#location")!, { target: { value: "Shanghai" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#birth-date")!, { target: { value: "1996-07-04" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#birth-time")!, { target: { value: "09:10" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#latitude")!, { target: { value: "31.2304" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#longitude")!, { target: { value: "121.4737" } });
    fireEvent.change(container.querySelector<HTMLInputElement>("#timezone")!, { target: { value: "8" } });

    fireEvent.click(container.querySelector('button[type="submit"]')!);
    await screen.findByText("Jupiter / Venus / Venus");

    fireEvent.click(screen.getByRole("button", { name: "测试解锁会员功能" }));

    expect(screen.getByRole("button", { name: "测试模式已开启" })).toBeInTheDocument();
    expect(screen.queryByText("付费解锁")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /整体解读/i })
    ).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /整体解读/i }));

    expect(await screen.findByText("好的，刘柳，茶已经泡好了。")).toBeInTheDocument();
    expect(screen.getByText("分析范围：D1本命盘、D9 Navamsa婚姻盘")).toBeInTheDocument();
    expect(screen.getByText("为什么？ 四条核心证据")).toBeInTheDocument();
    expect(screen.getByText("1. 你的“朋友圈”就是你的“发动机”")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "导出 PDF" }));

    expect(openSpy).toHaveBeenCalled();
    expect(documentWriteSpy).toHaveBeenCalled();
    expect(String(documentWriteSpy.mock.calls[0]?.[0] ?? "")).toContain("AI Reading Export");
    expect(String(documentWriteSpy.mock.calls[0]?.[0] ?? "")).not.toContain("**");

    fireEvent.click(screen.getByRole("button", { name: "开始 AI 校时" }));

    expect(
      await screen.findByText(/先说一个最早明显改变你人生轨迹的事件/)
    ).toBeInTheDocument();

    const dialogueInput = screen.getByPlaceholderText(
      /直接回答 AI 当前的问题/
    );

    fireEvent.change(dialogueInput, {
      target: { value: "2022 年我去职高读书，第一次长期离开家。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送回答" }));
    await screen.findByText(/这条迁移线索很关键/);

    fireEvent.change(dialogueInput, {
      target: { value: "2024 年开始正式打工，压力很大，但也第一次觉得自己能独立生活。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送回答" }));
    await screen.findByText(/我还需要一个关系或家庭上的关键节点/);

    fireEvent.change(dialogueInput, {
      target: { value: "2025 年和很重要的人分开，那段关系彻底改变了我。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送回答" }));

    expect(await screen.findByText("09:16")).toBeInTheDocument();
    expect(screen.getByText(/当前已整理 3 个事件/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("童年迁移")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2022")).toBeInTheDocument();
    expect(screen.getByDisplayValue("学业分流")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2024")).toBeInTheDocument();
    expect(screen.getByDisplayValue("关系转折")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025")).toBeInTheDocument();
    expect(screen.getByText("09:12 - 09:20")).toBeInTheDocument();
    expect(screen.getByText(/现在我已经能给出一个当前最可信的时间判断了/)).toBeInTheDocument();
  });
});
