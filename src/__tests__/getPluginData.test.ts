import { createFigma } from "../stubs";

describe("getPluginData", () => {
  beforeEach(() => {
    // @ts-ignore
    global.figma = createFigma({
      simulateErrors: true
    });
  });

  it("basic support", () => {
    const rect = figma.createRectangle();
    rect.setPluginData("key", "value");
    expect(rect.getPluginData("key")).toEqual("value");
  });

  it("can retreive keys", () => {
    const rect = figma.createRectangle();
    rect.setPluginData("key1", "value");
    rect.setPluginData("key2", "value");
    expect(rect.getPluginDataKeys()).toEqual(["key1", "key2"]);
  });

  it("removed node throws error", () => {
    const rect = figma.createRectangle();
    rect.setPluginData("key", "value");
    rect.remove();
    expect(() => {
      rect.getPluginData("key");
    }).toThrow("The node with id 1:2 does not exist");
  });

  describe("components and instances", () => {
    it("instances inherit plugin data from main component", () => {
      const component = figma.createComponent();
      component.setPluginData("foo", "bar");

      const instance = component.createInstance();

      expect(instance.getPluginData("foo")).toBe("bar");
    });

    it("the children of instances inherit data from the main component", () => {
      const component = figma.createComponent();
      const componentRect = figma.createRectangle();
      componentRect.setPluginData("foo", "bar");
      component.appendChild(componentRect);

      const instance = component.createInstance();
      const instanceRect = instance.findOne(node => node.type === "RECTANGLE");

      expect(instanceRect).not.toBeNull();
      expect(instanceRect.getPluginData("foo")).toBe("bar");
    });

    it("modifying the plugin data of the main component modifies the instance", () => {
      const component = figma.createComponent();
      component.setPluginData("foo", "bar");

      const instance = component.createInstance();

      component.setPluginData("foo", "baz");

      expect(instance.getPluginData("foo")).toBe("baz");
    });

    it("modifying the plugin data of the main component child modifies the instance child", () => {
      const component = figma.createComponent();
      const componentRect = figma.createRectangle();
      componentRect.setPluginData("foo", "bar");
      component.appendChild(componentRect);

      const instance = component.createInstance();
      componentRect.setPluginData("foo", "baz");
      const instanceRect = instance.findOne(node => node.type === "RECTANGLE");

      expect(instanceRect).not.toBeNull();
      expect(instanceRect.getPluginData("foo")).toBe("baz");
    });

    it("instances can override the main component plugin data", () => {
      const component = figma.createComponent();
      component.setPluginData("foo", "bar");

      const instance = component.createInstance();
      instance.setPluginData("foo", "baz");

      expect(instance.getPluginData("foo")).toBe("baz");
    });

    it('setting plugin data to "" deletes that key and reverts to the main component\'s pluginData for that key', () => {
      const component = figma.createComponent();
      component.setPluginData("foo", "bar");

      const instance = component.createInstance();
      instance.setPluginData("foo", "baz");

      expect(instance.getPluginData("foo")).toBe("baz");

      instance.setPluginData("foo", "");
      expect(instance.getPluginData("foo")).toBe("bar");
    });

    it("the children of instances can override the children of main component plugin data", () => {
      const component = figma.createComponent();
      const componentRect = figma.createRectangle();
      component.appendChild(componentRect);
      componentRect.setPluginData("foo", "bar");

      const instance = component.createInstance();
      const instanceRect = instance.findOne(
        child => child.type === "RECTANGLE"
      );
      instanceRect.setPluginData("foo", "baz");

      expect(instanceRect.getPluginData("foo")).toBe("baz");
    });

    // it("setting plugin data to \"\" in an instance child deletes that key and reverts to the main component's corresponding child's pluginData for that key", () => {
    //   const component = figma.createComponent();
    //   const componentRect = figma.createRectangle();
    //   component.appendChild(componentRect);
    //   componentRect.setPluginData("foo", "bar");

    //   const instance = component.createInstance();
    //   const instanceRect = instance.findOne(
    //     child => child.type === "RECTANGLE"
    //   );
    //   instanceRect.setPluginData("foo", "baz");

    //   expect(instanceRect.getPluginData("foo")).toBe("baz");

    //   componentRect.setPluginData("foo", "");

    //   expect(instanceRect.getPluginData("foo")).toBe("bar");
    // });
  });
});
