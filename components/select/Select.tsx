/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-danger */
/* eslint-disable no-nested-ternary */
import * as React from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import RcSelect from "rc-select"
import OptGroup from "./OptGroup"
import Option from "./Option"
import omit from "../_util/omit"
import Icon, { IconNames } from "../icon"
import { ConfigContext } from "../config-provider"
import { Placement } from "../pop-trigger"
import getPlacements from "../tooltip/placements"
import "./style"

/**
 * Select 封装于 rc-select: https://github.com/react-component/select
 * rc-select 本身 props 非常非常多。而如 onDropdownVisibleChange 这样的 prop 甚至不在文档中；
 * 调用 rc-select 的内置方法，Select 实现了功能的再封装，如内嵌搜索依靠的是 this.select.onInputChange；
 * rc-select 仍然有许多值得再封装和继续学习的余地，**未来的可维护空间是非常大的**。
 */

const noop = () => {}
const prefix = "adui-select"

export interface ISelect {
  forcePopupAlign?: () => void
  getRootDomNode?: () => HTMLElement
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  setInputValue?: (value?: string) => void
  getPopupDOMNode: () => HTMLElement
}

type ValueType = React.ReactText

export interface ISelectProps<T extends ValueType = ValueType> {
  [key: string]: any
  /**
   * 是否提供清除功能
   */
  allowClear?: boolean
  /**
   * 下拉框底部显示的自定义元素
   */
  bottomContent?: React.ReactNode
  /**
   * 子节点
   */
  children?: React.ReactNode
  /**
   * 附加类名
   */
  className?: string
  /**
   * 内部驱动：是否展开
   */
  defaultOpen?: boolean | null
  /**
   * 内部驱动：当前选中项的值
   */
  defaultValue?: T | null
  /**
   * 下拉列表是否和选择器同宽
   */
  dropdownMatchSelectWidth?: boolean
  /**
   * 指定弹出层的父级，默认为 document.body
   */
  getPopupContainer?: null | ((node: HTMLElement) => HTMLElement)
  /**
   * 下拉列表显示变化时的 handler，参数：bool
   */
  onDropdownVisibleChange?: (open: boolean) => void
  /**
   * 下拉列表滚动时的 handler, 参数：e
   */
  onPopupScroll?: (e: React.MouseEvent<HTMLDivElement>) => void
  /**
   * 搜索时的 handler, 参数：string
   */
  onSearch?: (val: string) => void
  /**
   * 搜索 CompositionStart 的 handler, 参数：string
   */
  onSearchCompositionStart?: (val: string) => void
  /**
   * 搜索 CompositionUpdate 的 handler, 参数：string
   */
  onSearchCompositionUpdate?: (val: string) => void
  /**
   * 搜索 CompositionEnd 的 handler, 参数：string
   */
  onSearchCompositionEnd?: (val: string) => void
  /**
   * 更多自定义 search input 的 Prop
   */
  searchInputProps?: {
    [key: string]: any
  }
  /**
   * 选择时的 handler，参数：(value, option)
   */
  onSelect?: (value: T, option: React.ReactElement<any>) => void
  /**
   * 外部控制：是否展开
   */
  open?: null | boolean
  /**
   * 可直接传入 options，替代手动构造 children jsx 的方式，需传入每项的 label 和 value
   */
  options?: {
    [key: string]: any
    className?: string
    disabled?: boolean
    label: React.ReactNode
    value: T
  }[]
  /**
   * 选择框默认文字
   */
  placeholder?: React.ReactNode
  /**
   * 选择框默认文字的颜色
   */
  placeholderColor?: string
  /**
   * 设置 placement
   */
  placement?: Placement
  /**
   * 设置右图标
   */
  rightIcon?: IconNames
  /**
   * 搜索框默认文字
   */
  searchable?: boolean
  /**
   * 是否需要内嵌搜索
   */
  searchPlaceholder?: string
  /**
   * 设置尺寸，跟着 button 走
   */
  size?: "mini" | "small" | "medium" | "large"
  /**
   * 设置主题
   */
  theme?: null | "light"
  /**
   * 下拉框顶部显示的自定义元素
   */
  topContent?: React.ReactNode
  /**
   * 外部控制：当前选中项的值
   */
  value?: T | null
}

export interface ISelectState<T extends ValueType = ValueType> {
  open?: boolean
  placeholderShow?: boolean
  placeholderText?: string
  value?: T | null
  selectId?: string
}

/**
 * 选择器用于选择某项内容。
 * 选择器对比单选 Radio 的优势是，当选项过多时，选择器可对内容收起，并更关注于已选项。
 * 通常，当用户能够通过已选项，轻易得知其余选项的规律时（如年份、城市等），选择器 Select 是比较好的选择。
 */
class Select<T extends ValueType = ValueType> extends React.Component<
  ISelectProps<T>,
  ISelectState<T>
> {
  public static type = "Select"

  public static Option: typeof Option = Option

  public static OptGroup: typeof OptGroup = OptGroup

  public static propTypes = {
    /**
     * 是否提供清除功能
     */
    allowClear: PropTypes.bool,
    /**
     * 下拉框底部显示的自定义元素
     */
    bottomContent: PropTypes.node,
    /**
     * 子节点
     */
    children: PropTypes.node,
    /**
     * 附加类名
     */
    className: PropTypes.string,
    /**
     * 内部驱动：是否展开
     */
    defaultOpen: PropTypes.bool,
    /**
     * 内部驱动：当前选中项的值
     */
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /**
     * 下拉列表是否和选择器同宽
     */
    dropdownMatchSelectWidth: PropTypes.bool,
    /**
     * 指定弹出层的父级，默认为 document.body
     */
    getPopupContainer: PropTypes.func,
    /**
     * 下拉列表显示变化时的 handler，参数：bool
     */
    onDropdownVisibleChange: PropTypes.func,
    /**
     * 下拉列表滚动时的 handler, 参数：e
     */
    onPopupScroll: PropTypes.func,
    /**
     * 搜索时的 handler, 参数：string
     */
    onSearch: PropTypes.func,
    /**
     * 搜索 CompositionStart 的 handler, 参数：string
     */
    onSearchCompositionStart: PropTypes.func,
    /**
     * 搜索 CompositionUpdate 的 handler, 参数：string
     */
    onSearchCompositionUpdate: PropTypes.func,
    /**
     * 搜索 CompositionEnd 的 handler, 参数：string
     */
    onSearchCompositionEnd: PropTypes.func,
    /**
     * 更多自定义 search input 的 Prop
     */
    searchInputProps: PropTypes.any,
    /**
     * 选择时的 handler，参数：(value, option)
     */
    onSelect: PropTypes.func,
    /**
     * 外部控制：是否展开
     */
    open: PropTypes.bool,
    /**
     * 可直接传入 options，替代手动构造 children jsx 的方式，需传入每项的 label 和 value
     */
    options: PropTypes.array,
    /**
     * 选择框默认文字
     */
    placeholder: PropTypes.any,
    /**
     * 选择框默认文字的颜色
     */
    placeholderColor: PropTypes.string,
    /**
     * 设置 placement
     */
    placement: PropTypes.oneOf([
      "top",
      "left",
      "right",
      "bottom",
      "topLeft",
      "topRight",
      "bottomLeft",
      "bottomRight",
      "leftTop",
      "leftBottom",
      "rightTop",
      "rightBottom",
    ]),
    /**
     * 设置右图标
     */
    rightIcon: PropTypes.any,
    /**
     * 搜索框默认文字
     */
    searchPlaceholder: PropTypes.string,
    /**
     * 是否需要内嵌搜索
     */
    searchable: PropTypes.bool,
    /**
     * 设置尺寸，跟着 button 走
     */
    size: PropTypes.oneOf(["mini", "small", "medium", "large"]),
    /**
     * 设置主题
     */
    theme: PropTypes.oneOf([null, "light"]),
    /**
     * 下拉框顶部显示的自定义元素
     */
    topContent: PropTypes.node,
    /**
     * 外部控制：当前选中项的值
     */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }

  public static defaultProps: ISelectProps = {
    allowClear: false,
    bottomContent: null,
    children: null,
    className: undefined,
    defaultOpen: null,
    defaultValue: null,
    dropdownMatchSelectWidth: true,
    getPopupContainer: null,
    onDropdownVisibleChange: noop,
    onPopupScroll: noop,
    onSearch: noop,
    onSearchCompositionStart: noop,
    onSearchCompositionUpdate: noop,
    onSearchCompositionEnd: noop,
    searchInputProps: {},
    onSelect: noop,
    open: null,
    options: undefined,
    placeholder: "请选择",
    placeholderColor: undefined,
    placement: "bottomLeft",
    rightIcon: "triangle-down",
    searchPlaceholder: "搜索",
    searchable: false,
    size: "small",
    theme: null,
    topContent: null,
  }

  public static getDerivedStateFromProps = ({ open, value }: ISelectProps) => {
    const newState: ISelectState = {}
    if (open !== null) {
      newState.open = open
    }
    if (value !== null) {
      if (value === "") {
        newState.value = undefined
      } else {
        newState.value = value
      }
    }
    return Object.keys(newState).length > 0 ? newState : null
  }

  public hash = Math.random().toString(36).slice(2)

  public locked = false

  public select: ISelect

  public search: HTMLInputElement

  public menu: JSX.Element

  constructor(props: ISelectProps<T>) {
    super(props)
    const { defaultOpen, defaultValue, open, value } = props

    let valueState: T | undefined
    if (value !== null) {
      if (value === "") {
        valueState = undefined
      } else {
        valueState = value
      }
    } else if (defaultValue !== null) {
      valueState = defaultValue
    }

    let openState
    if (open !== null) {
      openState = open
    } else if (defaultOpen !== null) {
      openState = defaultOpen
    }
    this.state = {
      open: openState,
      placeholderShow: false,
      selectId: "",
      placeholderText: "",
      value: valueState,
    }
  }

  public saveSelect = (node: ISelect) => {
    this.select = node
  }

  public saveSearch = (node: HTMLInputElement) => {
    this.search = node
  }

  public onDropdownVisibleChange = (open: boolean) => {
    const { onDropdownVisibleChange, open: openProp } = this.props
    const { value, selectId } = this.state

    if (this.locked) {
      return
    }
    if (openProp === null) {
      this.setState({ open })
    }
    if (open) {
      this.preventVisibleChange()

      setTimeout(() => {
        if (this.search) {
          if (value) {
            let id = selectId
            if (!selectId) {
              id = (this.search.parentNode?.nextSibling as Element)?.id
              this.setState({ selectId: id })
            }
            if (id) {
              const parent = document.getElementById(id)?.nextSibling as Element

              const el = parent?.getElementsByClassName(
                "adui-select-item-option-selected"
              )[0]?.children[0] as HTMLElement

              const listHolder = parent?.getElementsByClassName(
                "rc-virtual-list-holder"
              )[0] as HTMLElement

              if (listHolder) {
                listHolder.dispatchEvent(new Event("scroll"))

                if (listHolder.children[0]) {
                  listHolder.children[0].dispatchEvent(new Event("scroll"))
                }
              }

              if (el) {
                this.setState({
                  placeholderText: el.dataset.html || el.innerHTML,
                })
              }
            }
          } else {
            this.setState({
              placeholderText: "",
            })
          }
          this.search.focus()
        }
      }, 150)
    } else {
      if (this.search) {
        this.search.value = ""
      }
      this.setState({
        placeholderShow: false,
      })
    }
    if (onDropdownVisibleChange) {
      onDropdownVisibleChange(open)
    }
  }

  public onSelect = (value: T, option: any) => {
    const { onSelect, value: valueProp } = this.props

    if (valueProp === null) {
      this.setState({
        value,
      })
    }
    if (onSelect && valueProp !== value) {
      onSelect(value, option)
    }

    if (this.search) {
      this.search.value = ""
    }
    if (this.select && this.select.setInputValue) {
      this.select.setInputValue("")
    }
  }

  public handleDropdownRender = (menu: JSX.Element) => {
    this.menu = menu
    const {
      searchable,
      searchPlaceholder,
      searchInputProps,
      topContent,
      bottomContent,
    } = this.props
    if (searchable) {
      return (
        <div>
          {topContent}
          <div className={`${prefix}-search`}>
            <input
              ref={this.saveSearch}
              placeholder={searchPlaceholder}
              onChange={this.handleSearch}
              onCompositionStart={this.handleSearchStart}
              onCompositionUpdate={this.handleSearchUpdate}
              onCompositionEnd={this.handleSearchEnd}
              onKeyDown={this.handleSearchKeyDown}
              onMouseDown={this.preventVisibleChange}
              onMouseUp={this.preventVisibleChange}
              {...(searchInputProps || {})}
            />
            <Icon icon="search" className={`${prefix}-icon`} />
          </div>
          {menu}
          {bottomContent}
        </div>
      )
    }
    return (
      <>
        {topContent}
        {menu}
        {bottomContent}
      </>
    )
  }

  public handleSearchStart: React.CompositionEventHandler<HTMLInputElement> = (
    e
  ) => {
    const { onSearchCompositionStart } = this.props
    let target: HTMLInputElement
    if (e) {
      target = e.target as HTMLInputElement
    } else {
      target = this.search
    }
    if (onSearchCompositionStart) {
      onSearchCompositionStart(target.value)
    }
  }

  public handleSearchUpdate: React.CompositionEventHandler<HTMLInputElement> = (
    e
  ) => {
    const { onSearchCompositionUpdate } = this.props
    let target: HTMLInputElement
    if (e) {
      target = e.target as HTMLInputElement
    } else {
      target = this.search
    }
    if (onSearchCompositionUpdate) {
      onSearchCompositionUpdate(target.value)
    }
  }

  public handleSearchEnd: React.CompositionEventHandler<HTMLInputElement> = (
    e
  ) => {
    const { onSearchCompositionEnd } = this.props
    let target: HTMLInputElement
    if (e) {
      target = e.target as HTMLInputElement
    } else {
      target = this.search
    }
    if (onSearchCompositionEnd) {
      onSearchCompositionEnd(target.value)
    }
  }

  public handleSearch = (e?: React.ChangeEvent<HTMLInputElement>) => {
    let target: HTMLInputElement
    if (e) {
      target = e.target
    } else {
      target = this.search
    }
    const val = target.value
    const { placeholderShow, selectId } = this.state
    if (val && !placeholderShow) {
      this.setState({ placeholderShow: true })
    }
    if (!val && placeholderShow) {
      this.setState({ placeholderShow: false })
    }
    if (this.select) {
      let id = selectId
      if (!selectId) {
        id = (target.parentNode?.nextSibling as Element)?.id
        this.setState({ selectId: id })
      }
      const realInput = document.querySelector(
        `.adui-select-selection-search [aria-owns="${id}"]`
      ) as any
      if (realInput) {
        const lastValue = realInput.value
        realInput.value = val
        const event = new Event("input", { bubbles: true })
        // hack React16 内部定义了descriptor拦截value，此处重置状态
        const tracker = realInput._valueTracker
        if (tracker) {
          tracker.setValue(lastValue)
        }
        realInput.dispatchEvent(event)
      }
    }
  }

  public handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (this.select && this.select.onInputKeyDown) {
      this.select.onInputKeyDown(e)
    }
  }

  public preventVisibleChange = () => {
    this.locked = true
    setTimeout(() => {
      this.locked = false
      this.setState({ open: true })
    }, 200)
  }

  public render() {
    const {
      allowClear,
      className,
      getPopupContainer,
      onChange,
      options,
      placeholder,
      placeholderColor,
      placement,
      rightIcon,
      searchable,
      size,
      theme,
      value: valueProp,
      ...otherProps
    } = this.props

    const restProps = omit(otherProps, [
      "defaultValue",
      "open",
      "onDropdownVisibleChange",
      "onSelect",
      "searchPlaceholder",
      "onSearchCompositionStart",
      "onSearchCompositionUpdate",
      "onSearchCompositionEnd",
      "searchInputProps",
      "topContent",
      "bottomContent",
    ])

    const {
      open: openState,
      placeholderShow,
      placeholderText,
      value: valueState,
    } = this.state

    // openState 可能是 undefined or null
    const openProps: { open?: boolean; value?: React.ReactNode | null } = {}
    if (typeof openState === "boolean") {
      openProps.open = openState
    }
    if (valueState !== null) {
      openProps.value =
        valueProp === "" ? (
          placeholderColor ? (
            <span style={{ color: placeholderColor }}>{placeholder}</span>
          ) : (
            placeholder
          )
        ) : (
          valueState
        )
    }

    const transitionName = "slide-up"

    return (
      <ConfigContext.Consumer>
        {({ getPopupContainer: getPopupContainerContext }) => (
          <RcSelect
            allowClear={allowClear}
            className={classNames(
              className,
              `${prefix}-select`,
              `${prefix}-${size}`,
              {
                [`${prefix}-value_is_empty_string`]:
                  valueState === "" || valueState === undefined,
                [`${prefix}-light`]: theme === "light",
                [`${prefix}-select_placeholderShow`]: placeholderShow,
              }
            )}
            data-value={valueState || placeholder}
            menuItemSelectedIcon={null}
            dropdownAlign={
              getPlacements({ alignEdge: true })[placement || "bottomLeft"]
            }
            dropdownClassName={`adui-select-dropdown-${
              this.hash
            } adui-select-dropdown-${size} ${
              searchable ? "adui-select-dropdown-searchable" : ""
            }`}
            dropdownRender={this.handleDropdownRender}
            suffixIcon={
              <>
                {placeholderShow &&
                  (typeof (placeholderText || placeholder || "") ===
                  "string" ? (
                    <div
                      className={`${prefix}-placeholder-text`}
                      style={{
                        color: !valueState
                          ? placeholderColor || "var(--gray-700)"
                          : "var(--gray-900)",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: `${placeholderText || placeholder || ""}`,
                      }}
                    />
                  ) : (
                    <div
                      className={`${prefix}-placeholder-text`}
                      style={{
                        color: !valueState
                          ? placeholderColor || "var(--gray-700)"
                          : "var(--gray-900)",
                      }}
                    >
                      {placeholderText || placeholder || ""}
                    </div>
                  ))}
                <Icon
                  icon={rightIcon || "triangle-down"}
                  color="var(--transparent-gray-700)"
                />
              </>
            }
            clearIcon={
              <div
                style={{
                  background: `radial-gradient(
                    circle at 50% 50%, #fff 50%, transparent 50%
                  )`,
                }}
              >
                <Icon
                  icon="cancel-circle"
                  color="var(--transparent-gray-700)"
                />
              </div>
            }
            listHeight={250}
            listItemHeight={size === "large" ? 40 : size === "medium" ? 36 : 32}
            notFoundContent="无匹配结果"
            onDropdownVisibleChange={this.onDropdownVisibleChange}
            onSelect={this.onSelect}
            onChange={(v: T, ops: { [key: string]: any }) => {
              if (v === undefined && ops === undefined && allowClear) {
                this.onSelect(v, ops)
              }
              if (onChange) {
                onChange(v, ops)
              }
            }}
            defaultActiveFirstOption={false}
            getPopupContainer={getPopupContainer || getPopupContainerContext}
            optionLabelProp={options ? "label" : "children"}
            optionFilterProp={options ? "label" : "children"}
            options={options}
            placeholder={
              placeholderColor ? (
                <span style={{ color: placeholderColor }}>{placeholder}</span>
              ) : (
                placeholder
              )
            }
            prefixCls="adui-select"
            // 开启 showSearch 才可能 hack 式地触发 input change 事件
            showSearch
            ref={this.saveSelect}
            transitionName={transitionName}
            {...openProps}
            {...restProps}
          />
        )}
      </ConfigContext.Consumer>
    )
  }
}

export default Select
