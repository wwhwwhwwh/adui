import React, { useContext, useRef, useState } from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import { ConfigContext, getComputedSize } from "../config-provider"
import { useActive } from "../_util/hooks/use-active"
import "./style"

const prefix = "adui-switch"

export interface ISwitchProps {
  [key: string]: any
  /**
   * 开关状态 - 外部控制
   */
  checked?: null | boolean
  /**
   * 开状态时的附加文字
   */
  checkedText?: React.ReactNode
  /**
   * 附加类名
   */
  className?: string
  /**
   * 默认开关状态 - 内部驱动
   */
  defaultChecked?: null | boolean
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 开关状态改变时的 handler
   */
  onChange?: ((checked: boolean) => void) | null
  /**
   * 点击事件的 handler
   */
  onClick?: (() => void) | null
  /**
   * 设置尺寸
   */
  size?: "mini" | "small" | "medium" | "large"
  /**
   * 关状态时的附加文字
   */
  unCheckedText?: React.ReactNode
}

/**
 * 开关用于表示内容的开启与关闭，常用于开启或关闭某一功能、模式，也可以表示业务中的一些特殊逻辑，如广告的“投放/暂停”。
 */
const Switch: React.FC<ISwitchProps> = ({
  checked: checkedProps,
  checkedText,
  className,
  defaultChecked,
  disabled,
  onChange,
  onClick,
  onMouseDown,
  size,
  unCheckedText,
  ...otherProps
}: ISwitchProps) => {
  const [checked, setChecked] = useState(
    checkedProps !== null ? !!checkedProps : !!defaultChecked
  )

  // 相当于生命周期 getDerivedStateFromProps
  if (checkedProps !== null && checked !== !!checkedProps) {
    setChecked(!!checkedProps)
  }

  const { size: sizeContext } = useContext(ConfigContext)
  const ref = useRef<HTMLSpanElement>(null)
  const { handleMouseDown } = useActive({ ref, delay: 100 })

  const handleChange = () => {
    if (onClick) {
      onClick()
    }
    if (!disabled) {
      if (checkedProps === null) {
        setChecked(!checked)
      }
      if (onChange) {
        onChange(!checked)
      }
    }
  }

  const handleKeyPress = ({ key }: React.KeyboardEvent) => {
    if (key.toUpperCase() === "ENTER") {
      handleChange()
    }
  }

  const handleSpanMouseDown = (e: React.MouseEvent) => {
    if (onMouseDown) {
      onMouseDown(e)
    }
    handleMouseDown()
  }

  const classSet = classNames(
    className,
    `${prefix}-wrapper`,
    `${prefix}-${getComputedSize(size, sizeContext)}`,
    {
      [`${prefix}-checked`]: checked,
      [`${prefix}-disabled`]: disabled,
    }
  )

  return (
    <span
      aria-checked={checked}
      className={classSet}
      onClick={handleChange}
      onKeyPress={handleKeyPress}
      onMouseDown={handleSpanMouseDown}
      role="switch"
      ref={ref}
      tabIndex={0}
      {...otherProps}
    >
      <span className={`${prefix}-base`}>
        <i className={`${prefix}-indicator`} />
      </span>
      {!!checked && checkedText && (
        <span className={`${prefix}-text`}>{checkedText}</span>
      )}
      {!checked && unCheckedText && (
        <span className={`${prefix}-text`}>{unCheckedText}</span>
      )}
    </span>
  )
}

Switch.propTypes = {
  /**
   * 开关状态 - 外部控制
   */
  checked: PropTypes.oneOf([null, true, false]),
  /**
   * 开状态时的附加文字
   */
  checkedText: PropTypes.node,
  /**
   * 附加类名
   */
  className: PropTypes.string,
  /**
   * 默认开关状态 - 内部驱动
   */
  defaultChecked: PropTypes.oneOf([null, true, false]),
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 开关状态改变时的 handler
   */
  onChange: PropTypes.func,
  /**
   * 点击事件的 handler
   */
  onClick: PropTypes.func,
  /**
   * 设置尺寸
   */
  size: PropTypes.oneOf(["mini", "small", "medium", "large"]),
  /**
   * 关状态时的附加文字
   */
  unCheckedText: PropTypes.node,
}

Switch.defaultProps = {
  checked: null,
  checkedText: null,
  className: undefined,
  defaultChecked: null,
  disabled: false,
  onChange: null,
  onClick: null,
  size: "small",
  unCheckedText: null,
}

export default Switch
